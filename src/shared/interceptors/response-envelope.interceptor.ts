import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

export interface ResponseEnvelope<T> {
  data: T;
}

/** Envuelve toda respuesta exitosa en `{ data }` (los errores los formatea AllExceptionsFilter). */
@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  ResponseEnvelope<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ResponseEnvelope<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
