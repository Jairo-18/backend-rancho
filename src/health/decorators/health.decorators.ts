import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { HealthDto } from '../dtos/health.dto.js';

export function HealthDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Estado de la API y de la base (monitoreo del despliegue)',
    }),
    ApiOkResponse({ type: HealthDto }),
    ApiServiceUnavailableResponse({
      description: 'La base de datos no responde',
    }),
  );
}
