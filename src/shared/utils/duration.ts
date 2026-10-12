const SECONDS_PER_UNIT = { s: 1, m: 60, h: 3600, d: 86_400 } as const;

/** Convierte duraciones tipo `15m`, `7d` o `3600` a segundos. */
export function durationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) {
    throw new Error(`Duración inválida: "${value}"`);
  }
  const unit = (match[2] ?? 's') as keyof typeof SECONDS_PER_UNIT;
  return Number(match[1]) * SECONDS_PER_UNIT[unit];
}
