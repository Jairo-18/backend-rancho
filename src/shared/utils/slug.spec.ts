import { slugify, uniqueSlug } from './slug.js';

describe('slugify', () => {
  it('quita tildes, eñes y caracteres especiales', () => {
    expect(slugify('Cabaña del Roble')).toBe('cabana-del-roble');
    expect(slugify('  ¡Café de Origen! 500 g ')).toBe('cafe-de-origen-500-g');
  });
});

describe('uniqueSlug', () => {
  it('agrega sufijo cuando el slug ya existe', async () => {
    const taken = new Set(['cabana-del-roble', 'cabana-del-roble-2']);
    await expect(
      uniqueSlug('Cabaña del Roble', async (s) => taken.has(s)),
    ).resolves.toBe('cabana-del-roble-3');
  });

  it('evita slugs reservados', async () => {
    await expect(uniqueSlug('Admin', async () => false)).resolves.toBe(
      'admin-2',
    );
  });
});
