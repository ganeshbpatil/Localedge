import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, type JwtPayload } from '../auth.service.js';
import type { CurrentUserData } from '../../../common/decorators/current-user.decorator.js';
import type { AppConfig } from '../../../config/configuration.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<AppConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwtSecret') ?? 'change-this-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentUserData> {
    return this.authService.validateUser(payload);
  }
}
