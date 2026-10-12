import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module.js';
import { PricingController } from './controllers/pricing.controller.js';
import { PricingService } from './services/pricing.service.js';
import { PricingUC } from './useCases/pricingUC.uc.js';

@Module({
  imports: [SettingsModule],
  controllers: [PricingController],
  providers: [PricingUC, PricingService],
})
export class PricingModule {}
