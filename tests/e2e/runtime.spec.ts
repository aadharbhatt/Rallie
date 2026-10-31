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
  await expect(notice).toContainText('nonproduction');
  await expect(notice).toContainText('PDF extraction unavailable — mock off.');
  await expect(notice).toContainText('Tally unavailable — mock off.');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('unprovisioned setup differs from unhealthy dependency and unavailable API, with keyboard retry', async ({ page, request }) => {
  const healthy = healthSchema.parse(await (await request.get('/health')).json());
  await page.route('**/health', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'invalid_configuration', message: 'Environment setup incomplete.', requestId: '00000000-0000-4000-8000-000000000001' }) }));
  await page.goto('/');
  const connection = page.getByRole('status', { name: 'Workspace connection' });
  await expect(connection).toContainText('Environment unprovisioned');
  await expect(connection).toContainText('configure the application origin and required bindings');
  await page.unroute('**/health');
  await page.route('**/health', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ...healthy, status: 'degraded', readiness: 'unready', database: { status: 'error', probe: 'SELECT 1' } }) }));
  await page.getByRole('button', { name: 'Retry connection' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Runtime environment' })).toContainText('D1 probe failed');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.unroute('**/health');
  await page.route('**/health', (route) => route.abort('failed'));
  await page.reload();
  await expect(connection).toContainText('API unavailable');
});

test('staging banner is nonproduction and cannot advertise mock services (intercepted contract fixture)', async ({ page, request }) => {
  const healthy = healthSchema.parse(await (await request.get('/health')).json());
  await page.route('**/health', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...healthy, runtime: { environment: 'staging', extraction: 'unavailable', tally: 'unavailable' } }) }));
  await page.goto('/');
  await expect(page.getByRole('status', { name: 'Runtime environment' })).toContainText('Staging — nonproduction');
});

test('real Worker origin policy accepts selected local origin and rejects foreign/cross-environment preflight', async ({ request }) => {
  const healthy = healthSchema.parse(await (await request.get('/health')).json());
  const allowed = healthy.runtime.environment === 'dev' ? 'http://127.0.0.1:5174' : 'http://127.0.0.1:5175';
  const foreign = healthy.runtime.environment === 'dev' ? 'http://127.0.0.1:5175' : 'http://127.0.0.1:5174';
  const response = await request.get('/health', { headers: { Origin: allowed } });
  expect(response.status()).toBe(200);
  expect(response.headers()['access-control-allow-origin']).toBe(allowed);
  for (const Origin of [foreign, 'https://foreign.example.invalid', 'null']) {
    const denied = await request.get('/health', { headers: { Origin } });
    expect(denied.status()).toBe(403);
    expect(denied.headers()['access-control-allow-origin']).toBeUndefined();
  }
  const denied = await request.fetch('/health', { method: 'OPTIONS', headers: { Origin: allowed, 'Access-Control-Request-Method': 'POST' } });
  expect(denied.status()).toBe(403);
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