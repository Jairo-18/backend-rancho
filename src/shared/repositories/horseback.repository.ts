import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Horseback } from '../entities/horseback.entity.js';

@Injectable()
export class HorsebackRepository extends Repository<Horseback> {
  constructor(dataSource: DataSource) {
    super(Horseback, dataSource.createEntityManager());
  }
}
