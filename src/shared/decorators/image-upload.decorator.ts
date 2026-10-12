import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export const IMAGE_FIELD = 'file';

/**
 * Subida de UNA imagen por petición en el campo `file` (como en samawe): el
 * panel sube varias en secuencia, con progreso por foto, y ninguna petición
 * carga más de un archivo en la RAM del contenedor (multer usa memoria).
 * Límite de tamaño y tipos: MulterModule en UploadsModule.
 */
export const ImageUpload = (): MethodDecorator =>
  applyDecorators(
    UseInterceptors(FileInterceptor(IMAGE_FIELD)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: [IMAGE_FIELD],
        properties: { [IMAGE_FIELD]: { type: 'string', format: 'binary' } },
      },
    }),
  );
