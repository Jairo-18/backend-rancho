import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../shared/decorators/admin-only.decorator.js';
import {
  GetPublicSettingsDocs,
  RemoveLogoDocs,
  SetLogoDocs,
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

  @Put('logo')
  @AdminOnly()
  @SetLogoDocs()
  setLogo(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<SettingsDto> {
    return this._settingsUC.setLogo(file?.buffer);
  }

  @Delete('logo')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RemoveLogoDocs()
  removeLogo(): Promise<void> {
    return this._settingsUC.removeLogo();
  }
}
