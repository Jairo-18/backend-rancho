import {
  colombianHolidays,
  easterSunday,
  nightBefore,
} from './colombia-holidays.js';

describe('easterSunday', () => {
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
  ])('%i → %s', (year, expected) => {
    expect(easterSunday(year).toISOString().slice(0, 10)).toBe(expected);
  });
});

describe('colombianHolidays', () => {
  it('calcula los 18 festivos de 2026 según la Ley Emiliani', () => {
    expect(colombianHolidays(2026).map((h) => h.date)).toEqual([
      '2026-01-01',
      '2026-01-12', // Reyes (mar 6 → lun 12)
      '2026-03-23', // San José (jue 19 → lun 23)
      '2026-04-02',
      '2026-04-03',
      '2026-05-01',
      '2026-05-18', // Ascensión
      '2026-06-08', // Corpus Christi
      '2026-06-15', // Sagrado Corazón
      '2026-06-29', // San Pedro (ya es lunes)
      '2026-07-20',
      '2026-08-07',
      '2026-08-17', // Asunción (sáb 15 → lun 17)
      '2026-10-12', // Día de la Raza (ya es lunes)
      '2026-11-02', // Todos los Santos (dom 1 → lun 2)
      '2026-11-16', // Cartagena (mié 11 → lun 16)
      '2026-12-08',
      '2026-12-25',
    ]);
  });
});

describe('nightBefore', () => {
  it('cruza meses y años', () => {
    expect(nightBefore('2026-03-01')).toBe('2026-02-28');
    expect(nightBefore('2027-01-01')).toBe('2026-12-31');
  });
});
