import { Injectable } from '@nestjs/common';
import type { HotelSettings } from '../constants/settings.defaults.js';
import type { UpdateSettingsDto } from '../dtos/settings.dto.js';
import { SettingsService } from '../services/settings.service.js';

@Injectable()
export class SettingsUC {
  constructor(private readonly _settingsService: SettingsService) {}

  getPublic(): Promise<HotelSettings> {
    return this._settingsService.getAll();
  }

  update(dto: UpdateSettingsDto): Promise<HotelSettings> {
    return this._settingsService.update(dto);
  }
}
