import { Injectable } from '@nestjs/common';
import type { HotelSettings } from '../constants/settings.defaults.js';
import type { UpdateSettingsDto } from '../dtos/settings.dto.js';
import { SettingsService } from '../services/settings.service.js';
import { SettingsLogoService } from '../services/settingsLogo.service.js';

@Injectable()
export class SettingsUC {
  constructor(
    private readonly _settingsService: SettingsService,
    private readonly _settingsLogoService: SettingsLogoService,
  ) {}

  getPublic(): Promise<HotelSettings> {
    return this._settingsService.getAll();
  }

  update(dto: UpdateSettingsDto): Promise<HotelSettings> {
    return this._settingsService.update(dto);
  }

  async setLogo(file: Buffer | undefined): Promise<HotelSettings> {
    await this._settingsLogoService.set(file);
    return this._settingsService.getAll();
  }

  removeLogo(): Promise<void> {
    return this._settingsLogoService.remove();
  }
}
