import { defineConfig } from '@playwright/test';

// Use the already-running web preview. Real health tests also need Worker + D1.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  outputDir: '../test-results',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
});