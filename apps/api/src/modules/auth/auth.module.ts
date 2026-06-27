import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { OtpService } from './otp.service.js';
import { EncryptionService } from '../../common/services/encryption.service.js';
import type { AppConfig } from '../../config/configuration.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig>) => ({
        secret: config.get<string>('jwtSecret'),
        signOptions: { expiresIn: config.get<string>('jwtExpiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService, EncryptionService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
