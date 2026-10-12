import type { Request } from 'express';
import type { UserRole } from '../entities/user.entity.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  typ: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  typ: 'refresh';
  jti: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
