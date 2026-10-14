import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { SettingRepository } from '../../shared/repositories/setting.repository.js';
import { UploadsService } from '../../uploads/services/uploads.service.js';
import {
  LOGO_FOLDER,
  LOGO_STORAGE_KEY_SETTING,
} from '../constants/settings.defaults.js';

/**
 * Logo del hotel: un solo archivo. La URL (relativa) se guarda en el ajuste
 * `logoUrl` y la clave del archivo en `logoStorageKey`, que no se publica.
 */
@Injectable()
export class SettingsLogoService {
  constructor(
    private readonly _settingRepository: SettingRepository,
    private readonly _uploadsService: UploadsService,
  ) {}

  /** Pone o reemplaza el logo y borra el anterior del almacenamiento. */
  async set(file: Buffer | undefined): Promise<void> {
    if (!file)
      throw new BadRequestException('Adjunta el logo en el campo "file"');
    const previousKey = await this.storedKey();
    const [stored] = await this._uploadsService.storeImages(
      [await trimMargins(file)],
      LOGO_FOLDER,
    );
    try {
      await this._settingRepository.save([
        this._settingRepository.create({ key: 'logoUrl', value: stored.url }),
        this._settingRepository.create({
          key: LOGO_STORAGE_KEY_SETTING,
          value: stored.key,
        }),
      ]);
    } catch (error) {
      await this._uploadsService.deleteQuietly([stored.key]);
      throw error;
    }
    if (previousKey) await this._uploadsService.deleteQuietly([previousKey]);
  }

  /** Quita el logo: el sitio vuelve a mostrar la hoja de monstera. */
  async remove(): Promise<void> {
    const previousKey = await this.storedKey();
    await this._settingRepository.delete(['logoUrl', LOGO_STORAGE_KEY_SETTING]);
    if (previousKey) await this._uploadsService.deleteQuietly([previousKey]);
  }

  private async storedKey(): Promise<string | null> {
    const row = await this._settingRepository.findOne({
      where: { key: LOGO_STORAGE_KEY_SETTING },
    });
    return typeof row?.value === 'string' ? row.value : null;
  }
}

/**
 * Quita los márgenes de color uniforme (p. ej. un logo en JPG cuadrado con
 * mucho blanco alrededor) para que el logo llene su espacio en el sitio. Si el
 * archivo no es una imagen válida se devuelve tal cual y el procesador de
 * imágenes responde con el error de siempre.
 */
async function trimMargins(file: Buffer): Promise<Buffer> {
  try {
    return await sharp(file, { limitInputPixels: 100_000_000 })
      .rotate()
      .trim({ threshold: 18 })
      .png()
      .toBuffer();
  } catch {
    return file;
  }
}
