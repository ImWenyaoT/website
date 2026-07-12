import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: [
        'src/dictionary/**/*.ts',
        'src/site/**/*.ts',
        'src/data/**/*.ts',
        'src/integrations/**/*.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      reporter: [['text', { skipFull: false }], 'json-summary'],
      thresholds: {
        statements: 100,
        branches: 80,
        functions: 100,
        lines: 100,
      },
    },
  },
});
