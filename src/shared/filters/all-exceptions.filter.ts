import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

export interface ErrorResponseBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
}

interface ResolvedError {
  status: number;
  message: string;
  details?: string[];
}

/** Formato único de error para toda la API: `{ statusCode, error, message, details?, path, timestamp }`. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { status, message, details } = this.resolve(exception);

    if (status >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      error: (HttpStatus[status] as string | undefined) ?? 'ERROR',
      message,
      ...(details ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(body);
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        return { status, message: body };
      }
      const { message } = body as { message?: string | string[] };
      if (Array.isArray(message)) {
        return {
          status,
          message: 'Los datos enviados no son válidos',
          details: message,
        };
      }
      return { status, message: message ?? exception.message };
    }

    if (exception instanceof QueryFailedError) {
      const { code } = exception.driverError as { code?: string };
      if (code === '23505') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Ya existe un registro con esos datos',
        };
      }
      if (code === '23503') {
        return {
          status: HttpStatus.CONFLICT,
          message: 'El registro está relacionado con otros datos',
        };
      }
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    };
  }
}
