import { PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  STATUS_FILTERS,
  type StatusFilter,
} from '../../shared/dtos/admin-list-query.dto.js';
import { PriceRuleType } from '../../shared/entities/priceRule.entity.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MESSAGE = 'debe tener el formato AAAA-MM-DD';

export class PriceRuleDto {
  id: string;
  name: string;
  /** Primera noche (incluida). */
  startDate: string;
  /** Última noche (incluida). */
  endDate: string;
  /** null = todas las habitaciones. */
  roomId: string | null;
  roomName: string | null;
  /** FIXED = precio por noche en COP · PERCENT = ajuste % sobre el precio base. */
  type: PriceRuleType;
  value: number;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreatePriceRuleDto {
  /** @example "Puente de Todos los Santos" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  /** Primera noche (incluida). @example "2026-10-31" */
  @Matches(DATE_PATTERN, { message: `startDate ${DATE_MESSAGE}` })
  startDate: string;

  /** Última noche (incluida). @example "2026-11-01" */
  @Matches(DATE_PATTERN, { message: `endDate ${DATE_MESSAGE}` })
  endDate: string;

  /** Omitir o null = todas las habitaciones. */
  @IsOptional()
  @IsUUID('all')
  roomId?: string | null;

  @IsEnum(PriceRuleType)
  type: PriceRuleType;

  /** FIXED: COP por noche (> 0). PERCENT: entre -90 y 300 (ej. 20 = +20 %). @example 15 */
  @IsInt()
  @Min(-90)
  @Max(50_000_000)
  value: number;

  /** Mayor número gana si varias reglas cubren la misma noche. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePriceRuleDto extends PartialType(CreatePriceRuleDto) {}

export class PriceRuleQueryDto {
  /** Busca en el nombre. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(STATUS_FILTERS)
  status?: StatusFilter = 'all';

  /** Solo reglas que cubren alguna noche de este año. @example 2026 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;
}
