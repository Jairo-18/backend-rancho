import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { QuoteDto } from '../dtos/quote.dto.js';

export function QuoteDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Desglose noche por noche y total estimado (máx. 30 noches)',
      description:
        'Prioridad por noche: regla especial › fin de semana › entre semana.',
    }),
    ApiOkResponse({ type: QuoteDto }),
    ApiBadRequestResponse({
      description: 'Fechas inválidas, pasadas o estancia de más de 30 noches',
    }),
    ApiNotFoundResponse({ description: 'Habitación no encontrada o inactiva' }),
  );
}
