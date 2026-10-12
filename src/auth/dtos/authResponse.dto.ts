import { UserRole } from '../../shared/entities/user.entity.js';

export class AuthUserDto {
  id: string;
  email: string;
  role: UserRole;
}

export class AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  /** Segundos de vida del access token. */
  expiresIn: number;
  user: AuthUserDto;
}
