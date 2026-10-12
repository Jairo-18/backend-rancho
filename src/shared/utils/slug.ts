export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 140;

/** Slugs que chocarían con rutas fijas (p. ej. `GET /rooms/admin`). */
const RESERVED_SLUGS = new Set(['admin']);

/** "Cabaña del Roble" → "cabana-del-roble" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH - 4)
    .replace(/-+$/g, '');
}

/**
 * Devuelve `base` o `base-2`, `base-3`… hasta encontrar uno libre.
 * `isTaken` consulta la tabla correspondiente.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base) || 'item';
  let candidate = root;
  for (
    let suffix = 2;
    RESERVED_SLUGS.has(candidate) || (await isTaken(candidate));
    suffix++
  ) {
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}
