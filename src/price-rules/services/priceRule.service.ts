import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { definedOnly } from '../../shared/utils/defined-only.js';
import { ilikeContains } from '../../shared/utils/ilike.js';
import { isCalendarDate } from '../../pricing/utils/pricing.calculator.js';
import type {
  CreatePriceRuleDto,
  PriceRuleDto,
  PriceRuleQueryDto,
  UpdatePriceRuleDto,
} from '../dtos/priceRule.dto.js';
import {
  PriceRule,
  PriceRuleType,
} from '../../shared/entities/priceRule.entity.js';
import { PriceRuleRepository } from '../../shared/repositories/priceRule.repository.js';
import { RoomRepository } from '../../shared/repositories/room.repository.js';

import {
  PRICE_RULE_MAX_PERCENT,
  PRICE_RULE_NOT_FOUND,
} from '../constants/priceRule.constants.js';

function toDto(rule: PriceRule): PriceRuleDto {
  return {
    id: rule.id,
    name: rule.name,
    startDate: rule.startDate,
    endDate: rule.endDate,
    roomId: rule.roomId,
    roomName: rule.room?.name ?? null,
    type: rule.type,
    value: rule.value,
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

@Injectable()
export class PriceRuleService {
  constructor(
    private readonly _priceRuleRepository: PriceRuleRepository,
    private readonly _roomRepository: RoomRepository,
  ) {}

  async findAll({
    search,
    status = 'all',
    year,
  }: PriceRuleQueryDto): Promise<PriceRuleDto[]> {
    const query = this._priceRuleRepository
      .createQueryBuilder('rule')
      .leftJoinAndSelect('rule.room', 'room')
      .orderBy('rule.startDate', 'ASC')
      .addOrderBy('rule.priority', 'DESC');
    if (status !== 'all') {
      query.andWhere('rule.isActive = :isActive', {
        isActive: status === 'active',
      });
    }
    if (search?.trim()) {
      query.andWhere('rule.name ILIKE :search', {
        search: ilikeContains(search),
      });
    }
    if (year) {
      query.andWhere(
        'rule.startDate <= :yearEnd AND rule.endDate >= :yearStart',
        {
          yearStart: `${year}-01-01`,
          yearEnd: `${year}-12-31`,
        },
      );
    }
    return (await query.getMany()).map(toDto);
  }

  async findOne(id: string): Promise<PriceRuleDto> {
    return toDto(await this.getOrFail(id));
  }

  async create(dto: CreatePriceRuleDto): Promise<PriceRuleDto> {
    const data = {
      name: dto.name.trim(),
      startDate: dto.startDate,
      endDate: dto.endDate,
      type: dto.type,
      value: dto.value,
      roomId: dto.roomId ?? null,
      priority: dto.priority ?? 0,
      isActive: dto.isActive ?? true,
    };
    await this.validate(data);
    const rule = await this._priceRuleRepository.save(
      this._priceRuleRepository.create(data),
    );
    return this.findOne(rule.id);
  }

  async update(id: string, dto: UpdatePriceRuleDto): Promise<PriceRuleDto> {
    const current = await this.getOrFail(id);
    const changes = definedOnly(dto);
    await this.validate({
      startDate: changes.startDate ?? current.startDate,
      endDate: changes.endDate ?? current.endDate,
      roomId: changes.roomId === undefined ? current.roomId : changes.roomId,
      type: changes.type ?? current.type,
      value: changes.value ?? current.value,
    });
    await this._priceRuleRepository.update(
      { id },
      {
        ...changes,
        ...(changes.name !== undefined && { name: changes.name.trim() }),
      },
    );
    return this.findOne(id);
  }

  /** Las reglas sí se borran físicamente (no son contenido del sitio). */
  async remove(id: string): Promise<void> {
    const result = await this._priceRuleRepository.delete({ id });
    if (!result.affected) throw new NotFoundException(PRICE_RULE_NOT_FOUND);
  }

  private async getOrFail(id: string): Promise<PriceRule> {
    const rule = await this._priceRuleRepository.findOne({
      where: { id },
      relations: { room: true },
    });
    if (!rule) throw new NotFoundException(PRICE_RULE_NOT_FOUND);
    return rule;
  }

  private async validate(rule: {
    startDate: string;
    endDate: string;
    roomId?: string | null;
    type: PriceRuleType;
    value: number;
  }): Promise<void> {
    if (!isCalendarDate(rule.startDate) || !isCalendarDate(rule.endDate)) {
      throw new BadRequestException('Las fechas no son válidas');
    }
    if (rule.endDate < rule.startDate) {
      throw new BadRequestException(
        'La fecha final no puede ser anterior a la inicial',
      );
    }
    if (rule.type === PriceRuleType.Fixed && rule.value <= 0) {
      throw new BadRequestException('El precio fijo debe ser mayor que 0');
    }
    if (
      rule.type === PriceRuleType.Percent &&
      (rule.value < -90 || rule.value > PRICE_RULE_MAX_PERCENT)
    ) {
      throw new BadRequestException(
        `El ajuste porcentual debe estar entre -90 % y ${PRICE_RULE_MAX_PERCENT} %`,
      );
    }
    if (
      rule.roomId &&
      !(await this._roomRepository.existsBy({ id: rule.roomId }))
    ) {
      throw new BadRequestException('La habitación de la regla no existe');
    }
  }
}
