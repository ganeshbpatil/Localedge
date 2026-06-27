import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service.js';
import { OtpService } from './otp.service.js';
import type { AppConfig } from '../../config/configuration.js';
import type { CurrentUserData } from '../../common/decorators/current-user.decorator.js';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: string;
  email?: string | null;
  phone?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
    private readonly otpService: OtpService,
  ) {}

  async adminLogin(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: CurrentUserData }> {
    const user = await this.prisma.user.findFirst({
      where: { email, role: 'SUPER_ADMIN' },
      include: { tenant: true },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const storedHash = (user.metadata as Record<string, unknown>)?.['passwordHash'] as string | undefined;
    if (!storedHash) throw new UnauthorizedException('Password login not configured for this user');

    const valid = await bcrypt.compare(password, storedHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    return this.generateTokens(user);
  }

  async sendOtp(phone: string, tenantSlug?: string): Promise<{ message: string }> {
    // Optionally verify tenant
    if (tenantSlug) {
      const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug } });
      if (!tenant) throw new NotFoundException(`Tenant "${tenantSlug}" not found`);
    }

    const otp = await this.otpService.generateOtp(phone);
    // In real impl: send via SMS provider
    // For dev: log the OTP
    if (process.env['NODE_ENV'] !== 'production') {
      console.warn(`[DEV] OTP for ${phone}: ${otp}`);
    }

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(
    phone: string,
    otp: string,
    tenantSlug?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: CurrentUserData }> {
    const isValid = await this.otpService.verifyOtp(phone, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.prisma.user.findFirst({
      where: { phone },
      include: { tenant: true },
    });

    if (!user) {
      // Auto-create tenant + user for new signups
      const tenantName = `Business_${phone.slice(-4)}`;
      const tenant = await this.prisma.tenant.create({
        data: {
          name: tenantName,
          slug: `tenant-${Date.now()}`,
        },
      });

      user = await this.prisma.user.create({
        data: {
          tenantId: tenant.id,
          phone,
          name: 'Business Owner',
          role: 'TENANT_ADMIN',
          status: 'ACTIVE',
        },
        include: { tenant: true },
      });
    } else {
      // Update status to active
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' },
        include: { tenant: true },
      });
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwt.verify<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('refreshTokenSecret'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || user.status === 'SUSPENDED') {
        throw new UnauthorizedException('User not found or suspended');
      }

      const accessToken = this.jwt.sign(
        { sub: user.id, tenantId: user.tenantId, role: user.role, email: user.email, phone: user.phone },
        { expiresIn: this.config.get<string>('jwtExpiresIn') },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<CurrentUserData> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new UnauthorizedException('User is inactive or suspended');
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
    };
  }

  private generateTokens(user: { id: string; tenantId: string; role: string; email: string | null; phone: string | null; name: string }): {
    accessToken: string;
    refreshToken: string;
    user: CurrentUserData;
  } {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      phone: user.phone,
    };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: this.config.get<string>('jwtExpiresIn'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>('refreshTokenSecret'),
      expiresIn: this.config.get<string>('refreshTokenExpiresIn'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }
}
