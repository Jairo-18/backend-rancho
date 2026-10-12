import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AppConfig } from '../../config.js';
import type {
  AccessTokenPayload,
  AuthenticatedRequest,
} from '../interfaces/auth.interface.js';
import { UserRole } from '../entities/user.entity.js';

/** Exige un access token válido de un usuario ADMIN (único rol del sistema). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService<AppConfig, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    let payload: AccessTokenPayload;
    try {
      payload = await this._jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this._configService.get('jwt.accessSecret', { infer: true }),
      });
    } catch {
      throw new UnauthorizedException('La sesión expiró o no es válida');
    }

    if (payload.typ !== 'access' || payload.role !== UserRole.Admin) {
      throw new UnauthorizedException('La sesión expiró o no es válida');
    }

    request.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return true;
  }
}
