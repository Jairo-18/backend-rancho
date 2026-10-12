import { Injectable } from '@nestjs/common';
import type { QuoteDto, QuoteQueryDto } from '../dtos/quote.dto.js';
import { PricingService } from '../services/pricing.service.js';

@Injectable()
export class PricingUC {
  constructor(private readonly _pricingService: PricingService) {}

  quote(query: QuoteQueryDto): Promise<QuoteDto> {
    return this._pricingService.quote(query);
  }
}
