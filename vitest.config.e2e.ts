import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Flujos completos contra la base del VPS con subida y optimización de fotos.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
