/** Patrón `%texto%` para ILIKE, escapando los comodines que escriba el usuario. */
export function ilikeContains(text: string): string {
  return `%${text.trim().replace(/[%_\\]/g, '\\$&')}%`;
}
