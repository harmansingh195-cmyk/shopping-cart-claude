import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Scope Vitest to unit tests only — E2E specs live in src/test/e2e/
    // and are run separately via: npx playwright test
    include: ['src/test/js/**/*.test.js'],
    environment: 'jsdom',
  },
});
