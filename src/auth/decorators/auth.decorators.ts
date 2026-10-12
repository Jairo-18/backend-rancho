import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthTokensDto, AuthUserDto } from '../dtos/authResponse.dto.js';

/** Máximo 5 intentos por minuto por IP. */
export function LoginDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit: 5, ttl: 60_000 } }),
    ApiOperation({
      summary: 'Inicia sesión en el panel admin (5 intentos/min por IP)',
    }),
    ApiOkResponse({ type: AuthTokensDto }),
    ApiUnauthorizedResponse({ description: 'Correo o contraseña incorrectos' }),
    ApiTooManyRequestsResponse({
      description: 'Demasiados intentos; espera un minuto',
    }),
  );
}

export function RefreshDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.OK),
    ApiOperation({
      summary: 'Renueva la sesión; el refresh token usado queda invalidado',
    }),
    ApiOkResponse({ type: AuthTokensDto }),
    ApiUnauthorizedResponse({ description: 'Sesión expirada o inválida' }),
  );
}

export function LogoutDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({
      summary: 'Cierra la sesión: invalida el refresh token vigente',
    }),
    ApiNoContentResponse(),
  );
}

export function MeDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Usuario de la sesión actual' }),
    ApiOkResponse({ type: AuthUserDto }),
  );
}
