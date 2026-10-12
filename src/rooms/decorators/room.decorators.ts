import { applyDecorators, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ImageUpload } from '../../shared/decorators/image-upload.decorator.js';
import { RoomDto } from '../dtos/room.dto.js';

export function FindPublicRoomsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Habitaciones activas para el sitio público' }),
    ApiOkResponse({ type: RoomDto, isArray: true }),
  );
}

export function FindPublicRoomDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Detalle público de una habitación activa' }),
    ApiOkResponse({ type: RoomDto }),
    ApiNotFoundResponse({ description: 'No existe o está inactiva' }),
  );
}

export function FindAdminRoomsDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Todas las habitaciones (activas e inactivas), con búsqueda y filtro',
    }),
    ApiOkResponse({ type: RoomDto, isArray: true }),
  );
}

export function FindRoomByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Habitación por id (panel admin)' }),
    ApiOkResponse({ type: RoomDto }),
    ApiNotFoundResponse({ description: 'Habitación no encontrada' }),
  );
}

export function CreateRoomDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Crea la habitación inactiva; se activa al tener al menos 3 fotos',
    }),
    ApiOkResponse({ type: RoomDto }),
  );
}

export function UpdateRoomDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualiza la habitación (activar exige al menos 3 fotos)',
    }),
    ApiOkResponse({ type: RoomDto }),
    ApiBadRequestResponse({
      description: 'Datos inválidos o menos de 3 fotos al activar',
    }),
    ApiNotFoundResponse({ description: 'Habitación no encontrada' }),
  );
}

export function DeleteRoomDocs() {
  return applyDecorators(
    HttpCode(HttpStatus.NO_CONTENT),
    ApiOperation({ summary: 'Borrado lógico: desactiva la habitación' }),
    ApiNoContentResponse(),
    ApiNotFoundResponse({ description: 'Habitación no encontrada' }),
  );
}

export function UploadRoomImageDocs() {
  return applyDecorators(
    ImageUpload(),
    ApiOperation({
      summary: 'Sube UNA foto (jpg/png/webp). Rechaza si ya tiene 5',
    }),
    ApiOkResponse({ type: RoomDto }),
    ApiBadRequestResponse({
      description: 'Sin archivo o la habitación ya tiene 5 fotos',
    }),
  );
}

export function ReorderRoomImagesDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Reordena las fotos y, opcionalmente, cambia la portada',
    }),
    ApiOkResponse({ type: RoomDto }),
  );
}

export function DeleteRoomImageDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Borra una foto (una habitación activa no puede quedar con menos de 3)',
    }),
    ApiOkResponse({ type: RoomDto }),
  );
}
