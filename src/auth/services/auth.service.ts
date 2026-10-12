import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { durationToSeconds } from '../../shared/utils/duration.js';
import type { AppConfig } from '../../config.js';
import type {
  AccessTokenPayload,
  AuthUser,
  RefreshTokenPayload,
} from '../../shared/interfaces/auth.interface.js';
import type { AuthTokensDto } from '../dtos/authResponse.dto.js';
import { PASSWORD_HASH_ROUNDS } from '../constants/auth.constants.js';
import { UserRepository } from '../../shared/repositories/user.repository.js';

/** Hash de relleno: comparar contra él cuando el correo no existe evita revelar por tiempo de respuesta qué correos están registrados. */
const DUMMY_PASSWORD_HASH = bcrypt.hashSync(randomUUID(), PASSWORD_HASH_ROUNDS);

const INVALID_CREDENTIALS = 'Correo o contraseña incorrectos';
const INVALID_SESSION = 'La sesión expiró, vuelve a iniciar sesión';

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService<AppConfig, true>,
  ) {}

  async login(email: string, password: string): Promise<AuthTokensDto> {
    const user = await this._userRepository.findOne({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    const passwordOk = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );
    if (!user || !passwordOk) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }
    return this.issueTokens(user);
  }

  /** Rota el refresh token: el usado queda invalidado y se emite un par nuevo. */
  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this._jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this._configService.get('jwt.refreshSecret', { infer: true }),
        },
      );
    } catch {
      throw new UnauthorizedException(INVALID_SESSION);
    }
    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException(INVALID_SESSION);
    }

    const user = await this._userRepository.findOne({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, refreshTokenHash: true },
    });
    if (
      !user?.refreshTokenHash ||
      !this.hashMatches(refreshToken, user.refreshTokenHash)
    ) {
      throw new UnauthorizedException(INVALID_SESSION);
    }
    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this._userRepository.update(
      { id: userId },
      { refreshTokenHash: null },
    );
  }

  private async issueTokens(user: AuthUser): Promise<AuthTokensDto> {
    const accessExpiresIn = durationToSeconds(
      this._configService.get('jwt.accessExpiresIn', { infer: true }),
    );
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      typ: 'access',
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      typ: 'refresh',
      jti: randomUUID(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this._jwtService.signAsync(accessPayload, {
        secret: this._configService.get('jwt.accessSecret', { infer: true }),
        expiresIn: accessExpiresIn,
      }),
      this._jwtService.signAsync(refreshPayload, {
        secret: this._configService.get('jwt.refreshSecret', { infer: true }),
        expiresIn: durationToSeconds(
          this._configService.get('jwt.refreshExpiresIn', { infer: true }),
        ),
      }),
    ]);

    await this._userRepository.update(
      { id: user.id },
      { refreshTokenHash: sha256(refreshToken) },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  private hashMatches(token: string, storedHash: string): boolean {
    const expected = Buffer.from(storedHash, 'hex');
    const actual = Buffer.from(sha256(token), 'hex');
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
