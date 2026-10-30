import { expect, test } from '@playwright/test';
import { healthSchema } from '../../packages/api-contracts/src/index';

test('real local runtime exposes truthful default-off labels and accessible navigation', async ({ page, request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
  const health = healthSchema.parse(await response.json());
  expect(health.runtime.extraction).toBe('unavailable');
  expect(health.runtime.tally).toBe('unavailable');
  expect(['dev', 'test']).toContain(health.runtime.environment);
  await page.goto('/');
  const notice = page.getByRole('status', { name: 'Runtime environment' });
  await expect(notice).toContainText('PDF extraction unavailable — mock off.');
  await expect(notice).toContainText('Tally unavailable — mock off.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('explicit independent mock modes are visibly labeled as stubs, never working services', async ({ page, request }) => {
  const healthy = healthSchema.parse(await (await request.get('/health')).json());
  for (const [extraction, tally] of [['mock_stub', 'unavailable'], ['unavailable', 'mock_stub'], ['mock_stub', 'mock_stub']] as const) {
    await page.route('**/health', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...healthy, runtime: { environment: 'test', extraction, tally } }) }));
    await page.goto('/');
    const notice = page.getByRole('status', { name: 'Runtime environment' });
    await expect(notice).toContainText('Local test');
    await expect(notice).toContainText(extraction === 'mock_stub' ? 'Mock extraction enabled — stub only; no PDF extraction.' : 'PDF extraction unavailable — mock off.');
    await expect(notice).toContainText(tally === 'mock_stub' ? 'Mock Tally enabled — stub only; no accounting connection.' : 'Tally unavailable — mock off.');
    await page.unroute('**/health');
  }
});