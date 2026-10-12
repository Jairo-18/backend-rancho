import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { HealthDto } from '../dtos/health.dto.js';

@Injectable()
export class HealthService {
  constructor(private readonly _dataSource: DataSource) {}

  async check(): Promise<HealthDto> {
    try {
      await this._dataSource.query('SELECT 1');
    } catch {
      throw new ServiceUnavailableException('La base de datos no responde');
    }
    return { status: 'ok', database: 'up' };
  }
}
