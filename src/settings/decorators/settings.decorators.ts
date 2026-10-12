import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SettingsDto } from '../dtos/settings.dto.js';

export function GetPublicSettingsDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Ajustes visibles en el sitio (nombre, WhatsApp, dirección, redes…). Ninguno es secreto.',
    }),
    ApiOkResponse({ type: SettingsDto }),
  );
}

export function UpdateSettingsDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Actualiza solo las claves enviadas y devuelve todos los ajustes',
    }),
    ApiOkResponse({ type: SettingsDto }),
  );
}
