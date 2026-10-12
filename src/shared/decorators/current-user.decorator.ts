import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  AuthUser,
} from '../interfaces/auth.interface.js';

/** Usuario autenticado (requiere @AdminOnly()). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
