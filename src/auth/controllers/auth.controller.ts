import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import { CurrentUser } from '../../shared/decorators/current-user.decorator.js';
import type { AuthUser } from '../../shared/interfaces/auth.interface.js';
import {
  LoginDocs,
  LogoutDocs,
  MeDocs,
  RefreshDocs,
} from '../decorators/auth.decorators.js';
import { AuthTokensDto, AuthUserDto } from '../dtos/authResponse.dto.js';
import { LoginDto } from '../dtos/login.dto.js';
import { RefreshTokenDto } from '../dtos/refreshToken.dto.js';
import { AuthUC } from '../useCases/authUC.uc.js';

@Controller('auth')
@ApiTags('Autenticación')
export class AuthController {
  constructor(private readonly _authUC: AuthUC) {}

  @Post('login')
  @LoginDocs()
  login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this._authUC.login(dto);
  }

  @Post('refresh')
  @RefreshDocs()
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this._authUC.refresh(dto.refreshToken);
  }

  @Post('logout')
  @AdminOnly()
  @LogoutDocs()
  logout(@CurrentUser() user: AuthUser): Promise<void> {
    return this._authUC.logout(user);
  }

  @Get('me')
  @AdminOnly()
  @MeDocs()
  me(@CurrentUser() user: AuthUser): AuthUserDto {
    return this._authUC.me(user);
  }
}
