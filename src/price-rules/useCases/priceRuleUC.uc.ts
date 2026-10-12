import { Injectable } from '@nestjs/common';
import type {
  CreatePriceRuleDto,
  PriceRuleDto,
  PriceRuleQueryDto,
  UpdatePriceRuleDto,
} from '../dtos/priceRule.dto.js';
import { PriceRuleService } from '../services/priceRule.service.js';

@Injectable()
export class PriceRuleUC {
  constructor(private readonly _priceRuleService: PriceRuleService) {}

  findAll(query: PriceRuleQueryDto): Promise<PriceRuleDto[]> {
    return this._priceRuleService.findAll(query);
  }

  findOne(id: string): Promise<PriceRuleDto> {
    return this._priceRuleService.findOne(id);
  }

  create(dto: CreatePriceRuleDto): Promise<PriceRuleDto> {
    return this._priceRuleService.create(dto);
  }

  update(id: string, dto: UpdatePriceRuleDto): Promise<PriceRuleDto> {
    return this._priceRuleService.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this._priceRuleService.remove(id);
  }
}
