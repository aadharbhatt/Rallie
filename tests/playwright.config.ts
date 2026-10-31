import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gate = process.env.RALLIE_BROWSER_GATE;
if (gate && !['worker', 'web'].includes(gate)) throw new Error('Unknown foundation browser target.');
// Use the already-running web preview. Real health tests also need Worker + D1.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  forbidOnly: Boolean(process.env.CI),
  reporter: gate ? [
    ['list'],
    ['junit', { outputFile: resolve(root, `test-results/${gate}/results.xml`) }],
    ['html', { outputFolder: resolve(root, `playwright-report/${gate}`), open: 'never' }],
  ] : 'list',
  outputDir: resolve(root, gate ? `test-results/${gate}/artifacts` : 'test-results'),
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    browserName: 'chromium',
    trace: gate ? 'on' : 'retain-on-failure',
  },
});