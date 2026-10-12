import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Setting } from '../entities/setting.entity.js';

@Injectable()
export class SettingRepository extends Repository<Setting> {
  constructor(dataSource: DataSource) {
    super(Setting, dataSource.createEntityManager());
  }
}
