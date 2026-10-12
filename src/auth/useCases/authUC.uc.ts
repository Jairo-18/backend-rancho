import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../../shared/interfaces/auth.interface.js';
import type { AuthTokensDto, AuthUserDto } from '../dtos/authResponse.dto.js';
import type { LoginDto } from '../dtos/login.dto.js';
import { AuthService } from '../services/auth.service.js';

@Injectable()
export class AuthUC {
  constructor(private readonly _authService: AuthService) {}

  login(dto: LoginDto): Promise<AuthTokensDto> {
    return this._authService.login(dto.email, dto.password);
  }

  refresh(refreshToken: string): Promise<AuthTokensDto> {
    return this._authService.refresh(refreshToken);
  }

  logout(user: AuthUser): Promise<void> {
    return this._authService.logout(user.id);
  }

  me(user: AuthUser): AuthUserDto {
    return { id: user.id, email: user.email, role: user.role };
  }
}
