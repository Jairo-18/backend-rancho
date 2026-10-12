import { IsUUID, Matches } from 'class-validator';
import type { NightType } from '../utils/pricing.calculator.js';

const DATE_MESSAGE = 'debe tener el formato AAAA-MM-DD';

export class QuoteQueryDto {
  @IsUUID('all')
  roomId: string;

  /** Fecha de entrada (primera noche). @example "2026-10-24" */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: `checkIn ${DATE_MESSAGE}` })
  checkIn: string;

  /** Fecha de salida (esa noche no se cobra). @example "2026-10-26" */
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: `checkOut ${DATE_MESSAGE}` })
  checkOut: string;
}

export class QuoteRuleDto {
  id: string;
  name: string;
}

export class QuoteNightDto {
  /** @example "2026-10-24" */
  date: string;
  /** 0 = domingo … 6 = sábado. */
  dayOfWeek: number;
  /** WEEKDAY = entre semana · WEEKEND = fin de semana · SPECIAL = regla especial. */
  type: NightType;
  /** Precio sin regla especial (entre semana o fin de semana). */
  basePrice: number;
  price: number;
  rule: QuoteRuleDto | null;
}

export class QuoteDto {
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  currency: 'COP';
  fridayNightIsWeekend: boolean;
  nights: QuoteNightDto[];
  /** Total estimado en COP, sujeto a confirmación por el hotel. */
  total: number;
}
