import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuoteDocs } from '../decorators/pricing.decorators.js';
import { QuoteDto, QuoteQueryDto } from '../dtos/quote.dto.js';
import { PricingUC } from '../useCases/pricingUC.uc.js';

@Controller('pricing')
@ApiTags('Precios')
export class PricingController {
  constructor(private readonly _pricingUC: PricingUC) {}

  @Get('quote')
  @QuoteDocs()
  quote(@Query() query: QuoteQueryDto): Promise<QuoteDto> {
    return this._pricingUC.quote(query);
  }
}
