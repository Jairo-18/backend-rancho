import {
  type ApplicableRule,
  dayOfWeek,
  isCalendarDate,
  nightsBetween,
  pickRule,
  priceStay,
  todayIn,
} from './pricing.calculator.js';

// Octubre 2026: jue 22, vie 23, sáb 24, dom 25, lun 26, mar 27.
const ROOM_ID = 'room-roble';
const room = { weekdayPrice: 280_000, weekendPrice: 350_000 };

const rule = (overrides: Partial<ApplicableRule>): ApplicableRule => ({
  id: 'r1',
  name: 'Regla',
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  roomId: null,
  type: 'PERCENT',
  value: 20,
  priority: 0,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

const quote = (
  checkIn: string,
  checkOut: string,
  options: { rules?: ApplicableRule[]; fridayNightIsWeekend?: boolean } = {},
) =>
  priceStay({
    roomId: ROOM_ID,
    room,
    checkIn,
    checkOut,
    rules: options.rules ?? [],
    fridayNightIsWeekend: options.fridayNightIsWeekend ?? false,
  });

describe('priceStay', () => {
  it('entre semana: cobra el precio entre semana (lun → mié)', () => {
    const result = quote('2026-10-26', '2026-10-28');
    expect(result.nights.map((n) => [n.date, n.type, n.price])).toEqual([
      ['2026-10-26', 'WEEKDAY', 280_000],
      ['2026-10-27', 'WEEKDAY', 280_000],
    ]);
    expect(result.total).toBe(560_000);
  });

  it('fin de semana: sábado y domingo al precio de fin de semana', () => {
    const result = quote('2026-10-24', '2026-10-26');
    expect(result.nights.map((n) => [n.date, n.type, n.price])).toEqual([
      ['2026-10-24', 'WEEKEND', 350_000],
      ['2026-10-25', 'WEEKEND', 350_000],
    ]);
    expect(result.total).toBe(700_000);
  });

  it('estancia que cruza el fin de semana: precio por noche según su día (jue → mar)', () => {
    const result = quote('2026-10-22', '2026-10-27');
    expect(result.nights.map((n) => n.type)).toEqual([
      'WEEKDAY', // jue
      'WEEKDAY', // vie (por defecto entre semana)
      'WEEKEND', // sáb
      'WEEKEND', // dom
      'WEEKDAY', // lun
    ]);
    expect(result.total).toBe(3 * 280_000 + 2 * 350_000);
  });

  it('viernes configurable: con fridayNightIsWeekend el viernes es fin de semana', () => {
    expect(quote('2026-10-23', '2026-10-24').nights[0]).toMatchObject({
      type: 'WEEKDAY',
      price: 280_000,
    });
    expect(
      quote('2026-10-23', '2026-10-24', { fridayNightIsWeekend: true })
        .nights[0],
    ).toMatchObject({ type: 'WEEKEND', price: 350_000 });
  });

  describe('regla especial por fechas', () => {
    it('porcentual sobre el precio base de esa noche, solo en su rango', () => {
      const festivo = rule({
        id: 'festivo',
        name: 'Puente festivo',
        startDate: '2026-10-25',
        endDate: '2026-10-25',
        value: 15,
      });
      const result = quote('2026-10-24', '2026-10-27', { rules: [festivo] });
      expect(result.nights.map((n) => [n.type, n.price])).toEqual([
        ['WEEKEND', 350_000],
        ['SPECIAL', 402_500], // domingo 350.000 + 15 %
        ['WEEKDAY', 280_000],
      ]);
      expect(result.nights[1]).toMatchObject({
        basePrice: 350_000,
        rule: { id: 'festivo', name: 'Puente festivo' },
      });
    });

    it('precio fijo y descuento porcentual', () => {
      expect(
        quote('2026-10-26', '2026-10-27', {
          rules: [rule({ type: 'FIXED', value: 500_000 })],
        }).total,
      ).toBe(500_000);
      expect(
        quote('2026-10-26', '2026-10-27', { rules: [rule({ value: -10 })] })
          .total,
      ).toBe(252_000);
    });

    it('gana sobre el precio de fin de semana', () => {
      const result = quote('2026-10-24', '2026-10-25', {
        rules: [rule({ type: 'FIXED', value: 300_000 })],
      });
      expect(result.nights[0]).toMatchObject({
        type: 'SPECIAL',
        price: 300_000,
      });
    });

    it('ignora reglas de otras habitaciones', () => {
      const result = quote('2026-10-26', '2026-10-27', {
        rules: [rule({ roomId: 'otra-cabana' })],
      });
      expect(result.nights[0].type).toBe('WEEKDAY');
    });

    it('la fecha final de la regla está incluida', () => {
      const r = rule({ startDate: '2026-10-20', endDate: '2026-10-26' });
      expect(
        quote('2026-10-26', '2026-10-28', { rules: [r] }).nights.map(
          (n) => n.type,
        ),
      ).toEqual(['SPECIAL', 'WEEKDAY']);
    });
  });
});

describe('pickRule', () => {
  it('mayor prioridad gana; a igual prioridad, la de la habitación gana a la general', () => {
    const general = rule({ id: 'general', priority: 10 });
    const temporada = rule({ id: 'temporada', priority: 20 });
    const deLaCabana = rule({ id: 'cabana', priority: 10, roomId: ROOM_ID });
    expect(
      pickRule('2026-10-26', ROOM_ID, [general, temporada, deLaCabana])?.id,
    ).toBe('temporada');
    expect(pickRule('2026-10-26', ROOM_ID, [general, deLaCabana])?.id).toBe(
      'cabana',
    );
  });
});

describe('zona horaria', () => {
  const originalTz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it('el día de la semana no cambia con la zona horaria del servidor', () => {
    for (const tz of [
      'UTC',
      'America/Bogota',
      'Asia/Tokyo',
      'Pacific/Kiritimati',
    ]) {
      process.env.TZ = tz;
      expect(dayOfWeek('2026-10-24')).toBe(6); // sábado
      expect(quote('2026-10-24', '2026-10-25').nights[0].type).toBe('WEEKEND');
    }
  });

  it('"hoy" se calcula en Colombia: a las 10 p. m. de Bogotá ya es mañana en UTC', () => {
    const now = new Date('2026-10-24T03:00:00Z'); // vie 23 oct, 10:00 p. m. en Bogotá
    expect(todayIn('America/Bogota', now)).toBe('2026-10-23');
    expect(todayIn('UTC', now)).toBe('2026-10-24');
  });

  it('noches correctas al cruzar cambios de mes y de año', () => {
    expect(nightsBetween('2026-12-30', '2027-01-02')).toEqual([
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
    ]);
  });
});

describe('isCalendarDate', () => {
  it('rechaza fechas inexistentes o mal formadas', () => {
    expect(isCalendarDate('2026-10-24')).toBe(true);
    expect(isCalendarDate('2028-02-29')).toBe(true);
    expect(isCalendarDate('2026-02-29')).toBe(false);
    expect(isCalendarDate('2026-13-01')).toBe(false);
    expect(isCalendarDate('24/10/2026')).toBe(false);
  });
});
