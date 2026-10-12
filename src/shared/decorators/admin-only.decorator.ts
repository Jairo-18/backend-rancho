import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';

/** Ruta exclusiva del panel admin (JWT + rol ADMIN). */
export const AdminOnly = (): MethodDecorator & ClassDecorator =>
  applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Sin sesión o sesión expirada' }),
  );
