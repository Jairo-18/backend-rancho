import { Injectable, Logger } from '@nestjs/common';
import { ImageProcessorService } from './imageProcessor.service.js';
import { StorageService, type StoredFile } from './storage.service.js';

/** Punto de entrada de los módulos para guardar / borrar imágenes. */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly _storageService: StorageService,
    private readonly _imageProcessorService: ImageProcessorService,
  ) {}

  /** Valida y optimiza TODAS las imágenes antes de guardar alguna (todo o nada). */
  async storeImages(buffers: Buffer[], folder: string): Promise<StoredFile[]> {
    const processed = await Promise.all(
      buffers.map((b) => this._imageProcessorService.optimize(b)),
    );
    const stored: StoredFile[] = [];
    try {
      for (const image of processed) {
        stored.push(await this._storageService.save({ ...image, folder }));
      }
    } catch (error) {
      await this.deleteQuietly(stored.map((file) => file.key));
      throw error;
    }
    return stored;
  }

  /** Borra archivos sin propagar errores: un archivo huérfano no debe tumbar la operación. */
  async deleteQuietly(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await this._storageService.delete(key);
        } catch (error) {
          this.logger.warn(`No se pudo borrar ${key}: ${String(error)}`);
        }
      }),
    );
  }
}
