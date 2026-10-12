import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PriceRuleDto } from '../dtos/priceRule.dto.js';

export function FindPriceRulesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reglas de precio (festivos, temporadas), con filtros',
    }),
    ApiOkResponse({ type: PriceRuleDto, isArray: true }),
  );
}

export function FindPriceRuleDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Regla de precio por id' }),
    ApiOkResponse({ type: PriceRuleDto }),
    ApiNotFoundResponse({ description: 'Regla no encontrada' }),
  );
}

export function CreatePriceRuleDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crea una regla por fechas',
      description:
        'FIXED = precio por noche en COP · PERCENT = ajuste % sobre el precio base. Fechas de noches, ambas incluidas.',
    }),
    ApiOkResponse({ type: PriceRuleDto }),
    ApiBadRequestResponse({ description: 'Fechas o valores inválidos' }),
  );
}

export function UpdatePriceRuleDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Actualiza una regla de precio' }),
    ApiOkResponse({ type: PriceRuleDto }),
    ApiBadRequestResponse({ description: 'Fechas o valores inválidos' }),
  );
}

export function DeletePriceRuleDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Borra la regla (borrado físico)' }),
    ApiNoContentResponse(),
  );
}
