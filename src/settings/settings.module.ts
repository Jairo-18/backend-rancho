import { Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller.js';
import { SettingsService } from './services/settings.service.js';
import { SettingsUC } from './useCases/settingsUC.uc.js';

@Module({
  controllers: [SettingsController],
  providers: [SettingsUC, SettingsService],
  // `pricing` lo usa para leer fridayNightIsWeekend.
  exports: [SettingsService],
})
export class SettingsModule {}
