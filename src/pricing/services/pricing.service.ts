import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import type { AppConfig } from '../../config.js';
import { SettingsService } from '../../settings/services/settings.service.js';
import type { QuoteDto, QuoteQueryDto } from '../dtos/quote.dto.js';
import {
  addDays,
  isCalendarDate,
  MAX_NIGHTS,
  nightsBetween,
  priceStay,
  todayIn,
} from '../utils/pricing.calculator.js';
import { RoomRepository } from '../../shared/repositories/room.repository.js';
import { PriceRuleRepository } from '../../shared/repositories/priceRule.repository.js';

@Injectable()
export class PricingService {
  constructor(
    private readonly _roomRepository: RoomRepository,
    private readonly _priceRuleRepository: PriceRuleRepository,
    private readonly _settingsService: SettingsService,
    private readonly _configService: ConfigService<AppConfig, true>,
  ) {}

  async quote({ roomId, checkIn, checkOut }: QuoteQueryDto): Promise<QuoteDto> {
    this.validateDates(checkIn, checkOut);

    const room = await this._roomRepository.findOne({
      where: { id: roomId, isActive: true },
    });
    if (!room) throw new NotFoundException('Habitación no encontrada');

    const lastNight = addDays(checkOut, -1);
    const [rules, fridayNightIsWeekend] = await Promise.all([
      // Reglas activas que se cruzan con la estancia; el filtro por habitación lo hace el cálculo.
      this._priceRuleRepository.find({
        where: {
          isActive: true,
          startDate: LessThanOrEqual(lastNight),
          endDate: MoreThanOrEqual(checkIn),
        },
      }),
      this._settingsService.get('fridayNightIsWeekend'),
    ]);

    const result = priceStay({
      roomId,
      room,
      checkIn,
      checkOut,
      rules,
      fridayNightIsWeekend,
    });

    return {
      roomId,
      roomName: room.name,
      checkIn,
      checkOut,
      nightsCount: result.nights.length,
      currency: 'COP',
      fridayNightIsWeekend,
      nights: result.nights,
      total: result.total,
    };
  }

  private validateDates(checkIn: string, checkOut: string): void {
    if (!isCalendarDate(checkIn) || !isCalendarDate(checkOut)) {
      throw new BadRequestException('Las fechas no son válidas');
    }
    const today = todayIn(
      this._configService.get('app.timezone', { infer: true }),
    );
    if (checkIn < today) {
      throw new BadRequestException(
        'La fecha de entrada no puede ser anterior a hoy',
      );
    }
    const nights = nightsBetween(checkIn, checkOut).length;
    if (nights < 1) {
      throw new BadRequestException(
        'La fecha de salida debe ser posterior a la de entrada',
      );
    }
    if (nights > MAX_NIGHTS) {
      throw new BadRequestException(
        `La estancia máxima para cotizar es de ${MAX_NIGHTS} noches`,
      );
    }
  }
}
