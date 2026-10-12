import { Module } from '@nestjs/common';
import { PriceRuleController } from './controllers/priceRule.controller.js';
import { PriceRuleService } from './services/priceRule.service.js';
import { PriceRuleUC } from './useCases/priceRuleUC.uc.js';

@Module({
  controllers: [PriceRuleController],
  providers: [PriceRuleUC, PriceRuleService],
})
export class PriceRuleModule {}
