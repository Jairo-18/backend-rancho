import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ImageUpload } from '../../shared/decorators/image-upload.decorator.js';
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

export function SetLogoDocs() {
  return applyDecorators(
    ImageUpload(),
    ApiOperation({
      summary:
        'Sube o reemplaza el logo del hotel (borra el anterior) y devuelve los ajustes',
    }),
    ApiOkResponse({ type: SettingsDto }),
  );
}

export function RemoveLogoDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Quita el logo: el sitio vuelve al ícono por defecto' }),
    ApiNoContentResponse(),
  );
}
