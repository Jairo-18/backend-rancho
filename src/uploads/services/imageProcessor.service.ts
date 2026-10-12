import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import sharp from 'sharp';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);
const MAX_DIMENSION = 1920;
/**
 * Tope de píxeles descomprimidos (como en samawe): cierra las "bombas de
 * descompresión", un PNG de pocos KB que se expande a 40.000×40.000 y
 * reventaría la memoria del contenedor. 100 MP sobra para cualquier cámara.
 */
const LIMIT_INPUT_PIXELS = 100_000_000;

export interface ProcessedImage {
  buffer: Buffer;
  extension: 'webp';
  contentType: 'image/webp';
}

/** Valida el contenido real del archivo (no solo el mimetype) y lo optimiza a WebP. */
@Injectable()
export class ImageProcessorService {
  async optimize(input: Buffer): Promise<ProcessedImage> {
    let format: string | undefined;
    try {
      ({ format } = await sharp(input, {
        limitInputPixels: LIMIT_INPUT_PIXELS,
      }).metadata());
    } catch {
      throw new UnsupportedMediaTypeException(
        'El archivo no es una imagen válida',
      );
    }
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new UnsupportedMediaTypeException(
        'Solo se permiten imágenes JPG, PNG o WEBP',
      );
    }

    const buffer = await sharp(input, { limitInputPixels: LIMIT_INPUT_PIXELS })
      .rotate() // respeta la orientación EXIF de fotos de celular
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();

    return { buffer, extension: 'webp', contentType: 'image/webp' };
  }
}
