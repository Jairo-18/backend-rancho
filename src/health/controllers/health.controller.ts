import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthDocs } from '../decorators/health.decorators.js';
import { HealthDto } from '../dtos/health.dto.js';
import { HealthService } from '../services/health.service.js';

@Controller('health')
@ApiTags('Salud')
export class HealthController {
  constructor(private readonly _healthService: HealthService) {}

  @Get()
  @HealthDocs()
  check(): Promise<HealthDto> {
    return this._healthService.check();
  }
}
