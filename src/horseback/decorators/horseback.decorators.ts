import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ImageUpload } from '../../shared/decorators/image-upload.decorator.js';
import { HorsebackDto } from '../dtos/horseback.dto.js';

export function FindPublicHorsebackListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cabalgatas activas para el sitio público' }),
    ApiOkResponse({ type: HorsebackDto, isArray: true }),
  );
}

export function FindPublicHorsebackDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Detalle público de una cabalgata activa' }),
    ApiOkResponse({ type: HorsebackDto }),
    ApiNotFoundResponse({ description: 'No existe o está inactiva' }),
  );
}

export function FindAdminHorsebackListDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Todas las cabalgatas, con búsqueda y filtro' }),
    ApiOkResponse({ type: HorsebackDto, isArray: true }),
  );
}

export function FindHorsebackByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Cabalgata por id (panel admin)' }),
    ApiOkResponse({ type: HorsebackDto }),
    ApiNotFoundResponse({ description: 'Cabalgata no encontrada' }),
  );
}

export function CreateHorsebackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crea la cabalgata inactiva; se activa al tener al menos 1 foto',
    }),
    ApiOkResponse({ type: HorsebackDto }),
  );
}

export function UpdateHorsebackDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza la cabalgata (precio null = "Consultar precio")',
    }),
    ApiOkResponse({ type: HorsebackDto }),
    ApiBadRequestResponse({
      description: 'Datos inválidos o sin fotos al activar',
    }),
  );
}

export function DeleteHorsebackDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Borrado lógico: desactiva la cabalgata' }),
    ApiNoContentResponse(),
  );
}

export function UploadHorsebackImageDocs() {
  return applyDecorators(
    ImageUpload(),
    ApiOperation({ summary: 'Sube UNA foto. Máximo 5 por cabalgata' }),
    ApiOkResponse({ type: HorsebackDto }),
  );
}

export function ReorderHorsebackImagesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Reordena las fotos (la primera es la portada)' }),
    ApiOkResponse({ type: HorsebackDto }),
  );
}

export function DeleteHorsebackImageDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Borra una foto (una cabalgata activa no puede quedar sin fotos)',
    }),
    ApiOkResponse({ type: HorsebackDto }),
  );
}
