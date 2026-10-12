import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PriceRule } from '../entities/priceRule.entity.js';

@Injectable()
export class PriceRuleRepository extends Repository<PriceRule> {
  constructor(dataSource: DataSource) {
    super(PriceRule, dataSource.createEntityManager());
  }
}
