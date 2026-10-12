export interface Holiday {
  /** YYYY-MM-DD */
  date: string;
  name: string;
}

const DAY_MS = 86_400_000;

const utcDate = (year: number, month: number, day: number): Date =>
  new Date(Date.UTC(year, month - 1, day));

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * DAY_MS);

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Ley Emiliani: el festivo se traslada al lunes siguiente (si ya es lunes, se queda). */
const nextMonday = (date: Date): Date =>
  addDays(date, (8 - date.getUTCDay()) % 7);

/** Domingo de Pascua (algoritmo anónimo gregoriano / Meeus). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return utcDate(year, month, day);
}

/**
 * Festivos de Colombia (Ley 51 de 1983). Solo se usa para sembrar reglas de precio
 * de ejemplo: el administrador las gestiona después desde el panel.
 * Las fechas son de calendario (sin hora), por eso se opera en UTC sin riesgo de zona horaria.
 */
export function colombianHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  const holidays: [Date, string][] = [
    [utcDate(year, 1, 1), 'Año Nuevo'],
    [nextMonday(utcDate(year, 1, 6)), 'Reyes Magos'],
    [nextMonday(utcDate(year, 3, 19)), 'San José'],
    [addDays(easter, -3), 'Jueves Santo'],
    [addDays(easter, -2), 'Viernes Santo'],
    [utcDate(year, 5, 1), 'Día del Trabajo'],
    [addDays(easter, 43), 'Ascensión del Señor'],
    [addDays(easter, 64), 'Corpus Christi'],
    [addDays(easter, 71), 'Sagrado Corazón'],
    [nextMonday(utcDate(year, 6, 29)), 'San Pedro y San Pablo'],
    [utcDate(year, 7, 20), 'Día de la Independencia'],
    [utcDate(year, 8, 7), 'Batalla de Boyacá'],
    [nextMonday(utcDate(year, 8, 15)), 'Asunción de la Virgen'],
    [nextMonday(utcDate(year, 10, 12)), 'Día de la Raza'],
    [nextMonday(utcDate(year, 11, 1)), 'Todos los Santos'],
    [nextMonday(utcDate(year, 11, 11)), 'Independencia de Cartagena'],
    [utcDate(year, 12, 8), 'Inmaculada Concepción'],
    [utcDate(year, 12, 25), 'Navidad'],
  ];
  return holidays
    .map(([date, name]) => ({ date: toIsoDate(date), name }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Fecha de la noche anterior a un festivo (YYYY-MM-DD). */
export const nightBefore = (isoDate: string): string =>
  toIsoDate(addDays(new Date(`${isoDate}T00:00:00Z`), -1));
