/**
 * Copia solo las propiedades con valor distinto de `undefined`.
 * Necesario con DTOs: al compilar a ES2022+ las propiedades opcionales existen
 * como propias con valor `undefined` y un spread pisaría los valores actuales.
 */
export function definedOnly<T extends object>(source: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
