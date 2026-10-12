import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import {
  GetPublicSettingsDocs,
  UpdateSettingsDocs,
} from '../decorators/settings.decorators.js';
import { SettingsDto, UpdateSettingsDto } from '../dtos/settings.dto.js';
import { SettingsUC } from '../useCases/settingsUC.uc.js';

@Controller('settings')
@ApiTags('Ajustes')
export class SettingsController {
  constructor(private readonly _settingsUC: SettingsUC) {}

  @Get('public')
  @GetPublicSettingsDocs()
  getPublic(): Promise<SettingsDto> {
    return this._settingsUC.getPublic();
  }

  @Put()
  @AdminOnly()
  @UpdateSettingsDocs()
  update(@Body() dto: UpdateSettingsDto): Promise<SettingsDto> {
    return this._settingsUC.update(dto);
  }
}
