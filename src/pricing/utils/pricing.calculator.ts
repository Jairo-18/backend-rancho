/**
 * Cálculo de precios por noche (CONTEXT §3.2). Funciones puras, sin Nest ni base
 * de datos, para poder probarlas a fondo.
 *
 * Fechas: siempre strings `YYYY-MM-DD` de CALENDARIO (la noche del 24 de octubre
 * es la del 24 en Colombia). El día de la semana de una fecha de calendario no
 * depende de ninguna zona horaria, así que se calcula con aritmética de fechas
 * (Date.UTC) y nunca a partir de un instante. La zona horaria solo interviene
 * para saber qué día es "hoy" en Colombia (`todayIn`).
 */

export const MAX_NIGHTS = 30;

export type NightType = 'WEEKDAY' | 'WEEKEND' | 'SPECIAL';

export interface PricedRoom {
  weekdayPrice: number;
  weekendPrice: number;
}

export interface ApplicableRule {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  /** null = todas las habitaciones. */
  roomId: string | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  priority: number;
  createdAt: Date;
}

export interface NightPrice {
  /** Fecha de la noche (YYYY-MM-DD). */
  date: string;
  /** 0 = domingo … 6 = sábado. */
  dayOfWeek: number;
  type: NightType;
  /** Precio entre semana o fin de semana que habría sin regla especial. */
  basePrice: number;
  price: number;
  rule: { id: string; name: string } | null;
}

export interface QuoteResult {
  nights: NightPrice[];
  total: number;
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** Valida que sea una fecha de calendario real (rechaza 2026-02-30). */
export function isCalendarDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

function toUtcMidnight(value: string): number {
  const [y, m, d] = value.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMidnight(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function dayOfWeek(date: string): number {
  return new Date(toUtcMidnight(date)).getUTCDay();
}

export function addDays(date: string, days: number): string {
  return fromUtcMidnight(toUtcMidnight(date) + days * DAY_MS);
}

/** Noches entre la entrada y la salida (la noche de la salida no se cobra). */
export function nightsBetween(checkIn: string, checkOut: string): string[] {
  const count = Math.round(
    (toUtcMidnight(checkOut) - toUtcMidnight(checkIn)) / DAY_MS,
  );
  return Array.from({ length: Math.max(count, 0) }, (_, i) =>
    addDays(checkIn, i),
  );
}

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria dada, p. ej. America/Bogota. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  // en-CA formatea como YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

/**
 * Sábado y domingo son fin de semana. El viernes depende del ajuste
 * `fridayNightIsWeekend` (por defecto, entre semana).
 */
export function isWeekendNight(
  date: string,
  fridayNightIsWeekend: boolean,
): boolean {
  const day = dayOfWeek(date);
  return day === 6 || day === 0 || (fridayNightIsWeekend && day === 5);
}

/**
 * Regla que gana para una noche: la de mayor `priority`; a igual prioridad, la
 * de una habitación concreta sobre la general y, si aún empatan, la más nueva.
 */
export function pickRule(
  date: string,
  roomId: string,
  rules: ApplicableRule[],
): ApplicableRule | null {
  const candidates = rules.filter(
    (rule) =>
      rule.startDate <= date &&
      date <= rule.endDate &&
      (rule.roomId === null || rule.roomId === roomId),
  );
  candidates.sort(
    (a, b) =>
      b.priority - a.priority ||
      Number(b.roomId !== null) - Number(a.roomId !== null) ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );
  return candidates[0] ?? null;
}

export function applyRule(basePrice: number, rule: ApplicableRule): number {
  if (rule.type === 'FIXED') return rule.value;
  return Math.max(0, Math.round(basePrice * (1 + rule.value / 100)));
}

export function priceStay(params: {
  roomId: string;
  room: PricedRoom;
  checkIn: string;
  checkOut: string;
  rules: ApplicableRule[];
  fridayNightIsWeekend: boolean;
}): QuoteResult {
  const { roomId, room, rules, fridayNightIsWeekend } = params;
  const nights = nightsBetween(params.checkIn, params.checkOut).map(
    (date): NightPrice => {
      const weekend = isWeekendNight(date, fridayNightIsWeekend);
      const basePrice = weekend ? room.weekendPrice : room.weekdayPrice;
      const rule = pickRule(date, roomId, rules);
      return {
        date,
        dayOfWeek: dayOfWeek(date),
        type: rule ? 'SPECIAL' : weekend ? 'WEEKEND' : 'WEEKDAY',
        basePrice,
        price: rule ? applyRule(basePrice, rule) : basePrice,
        rule: rule ? { id: rule.id, name: rule.name } : null,
      };
    },
  );
  return { nights, total: nights.reduce((sum, night) => sum + night.price, 0) };
}
