import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['apps/*/src/**/*.test.ts', 'packages/*/src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    exclude: ['scripts/*.integration.test.mjs'],
    environment: 'node',
  },
});