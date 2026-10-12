import { Global, Module, UnsupportedMediaTypeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import type { AppConfig } from '../config.js';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ImageProcessorService,
} from './services/imageProcessor.service.js';
import { LocalStorageService } from './services/localStorage.service.js';
import { StorageService } from './services/storage.service.js';
import { UploadsService } from './services/uploads.service.js';

@Global()
@Module({
  imports: [
    // Límites de multer compartidos por todos los FilesInterceptor de la app.
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        limits: {
          fileSize: config.get('uploads.maxMb', { infer: true }) * 1024 * 1024,
          files: 1,
        },
        fileFilter: (_req, file, callback) => {
          if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(
              new UnsupportedMediaTypeException(
                'Solo se permiten imágenes JPG, PNG o WEBP',
              ),
              false,
            );
          }
        },
      }),
    }),
  ],
  providers: [
    {
      provide: StorageService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) =>
        new LocalStorageService({
          rootDir: config.get('uploads.dir', { infer: true }),
          baseUrl: config.get('app.baseUrl', { infer: true }),
        }),
    },
    ImageProcessorService,
    UploadsService,
  ],
  exports: [MulterModule, StorageService, UploadsService],
})
export class UploadsModule {}
