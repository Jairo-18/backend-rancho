import { Injectable } from '@nestjs/common';
import type { UpdateSettingsDto } from '../dtos/settings.dto.js';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { Setting } from '../../shared/entities/setting.entity.js';
import {
  DEFAULT_SETTINGS,
  EDITABLE_SETTING_KEYS,
  type HotelSettings,
  SETTING_KEYS,
} from '../constants/settings.defaults.js';
import { SettingRepository } from '../../shared/repositories/setting.repository.js';
import { StorageService } from '../../uploads/services/storage.service.js';

@Injectable()
export class SettingsService {
  constructor(
    private readonly _settingRepository: SettingRepository,
    private readonly _storageService: StorageService,
  ) {}

  /** Ajustes guardados combinados con los valores por defecto (claves desconocidas se ignoran). */
  async getAll(): Promise<HotelSettings> {
    const rows = await this._settingRepository.find();
    const stored = new Map(rows.map((row) => [row.key, row.value]));
    const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const key of SETTING_KEYS) {
      if (stored.has(key)) {
        result[key] = stored.get(key);
      }
    }
    result.socials = {
      ...DEFAULT_SETTINGS.socials,
      ...(result.socials as object),
    };
    if (typeof result.logoUrl === 'string' && result.logoUrl) {
      result.logoUrl = this._storageService.publicUrl(result.logoUrl);
    }
    return result as unknown as HotelSettings;
  }

  async get<K extends keyof HotelSettings>(key: K): Promise<HotelSettings[K]> {
    return (await this.getAll())[key];
  }

  async update(dto: UpdateSettingsDto): Promise<HotelSettings> {
    const current = await this.getAll();
    const rows: Setting[] = [];
    for (const key of EDITABLE_SETTING_KEYS) {
      const value = dto[key];
      if (value === undefined) continue;
      rows.push(
        this._settingRepository.create({
          key,
          // socials se combina para permitir actualizar una sola red.
          value:
            key === 'socials'
              ? { ...current.socials, ...definedOnly(dto.socials ?? {}) }
              : value,
        }),
      );
    }
    if (rows.length > 0) {
      await this._settingRepository.save(rows);
    }
    return this.getAll();
  }
}
