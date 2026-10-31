import { expect, test } from '@playwright/test';
import { healthSchema, livenessSchema, apiErrorSchema } from '../../packages/api-contracts/src/index';

test('Worker deep links and API routes keep their distinct HTML/JSON contracts', async ({ request, page }) => {
  for (const path of ['/catalogue?q=079n', '/settings', '/not-a-page']) {
    const response = await request.get(path, { headers: { Accept: 'text/html' } });
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  }
  for (const path of ['/api', '/api/unknown', '/api/auth/session']) {
    const response = await request.get(path, { headers: { Accept: 'text/html' } });
    expect(response.status()).toBe(404);
    expect(response.headers()['content-type']).toContain('application/json');
    expect(apiErrorSchema.parse(await response.json()).code).toBe('not_found');
  }
  const live = await request.get('/health/live');
  expect(live.status()).toBe(200);
  expect(livenessSchema.parse(await live.json()).status).toBe('alive');
  const ready = await request.get('/health');
  expect(healthSchema.parse(await ready.json()).readiness).toBe('ready');
  await page.goto('/settings');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await expect(page.getByRole('status', { name: 'Runtime environment' })).toContainText('Local');
  await expect(page.getByText('Foundation preview —', { exact: false })).toBeVisible();
  expect(await page.getByRole('heading', { level: 1 }).count()).toBe(1);
  await page.goto('/not-a-page');
  await page.getByRole('link', { name: 'Back to dashboard' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('mobile drawer traps focus, dismisses safely, and route selection focuses main', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/settings');
  const trigger = page.getByRole('button', { name: 'Open navigation' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
  await expect(drawer).toBeVisible();
  for (let index = 0; index < 9; index++) {
    await page.keyboard.press('Tab');
    expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await trigger.click();
  await drawer.getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await trigger.click();
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(drawer).not.toBeVisible();
  await expect(trigger).not.toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  for (const width of [320, 360, 760, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('slow cold bootstrap has bounded keyboard recovery, never a warm-route splash', async ({ page }) => {
  await page.clock.install();
  await page.route('**/health', () => {});
  await page.goto('/settings');
  await page.clock.runFor(1_100);
  await expect(page.getByRole('status', { name: 'Opening workspace' })).toContainText('Opening your workspace…');
  await page.clock.runFor(10_000);
  await expect(page.getByRole('status', { name: 'Workspace connection' })).toContainText('API unavailable');
  await expect(page.getByRole('status', { name: 'Opening workspace' })).toHaveCount(0);
  await page.unroute('**/health');
  await page.getByRole('button', { name: 'Retry connection' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status', { name: 'Runtime environment' })).toContainText('Local');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: 'Tally', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tally');
  await expect(page.getByRole('status', { name: 'Opening workspace' })).toHaveCount(0);
});

test('Save-Data boot loads only the current feature and loading keeps navigation usable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  const modules: string[] = [];
  page.on('request', (request) => { if (/\/assets\/.*\.js/.test(request.url())) modules.push(request.url()); });
  await page.goto('/settings');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await page.getByRole('link', { name: 'Quotations', exact: true }).focus();
  expect(modules.some((url) => /\/(catalogue|quotations|tally|dashboard)-/.test(url))).toBe(false);
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/assets/catalogue-*.js', async (route) => { await gate; await route.continue(); });
  await page.getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  release();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catalogue');
});

test('failed page chunk stays inside the shell and explicit retry recovers without reload', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.goto('/settings');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await page.evaluate(() => { (globalThis as typeof globalThis & { shellSentinel: string }).shellSentinel = 'retained'; });
  await page.route('**/assets/tally-*.js', (route) => route.abort());
  await page.getByRole('link', { name: 'Tally', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'This page couldn’t load.' })).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page).toHaveURL(/\/tally$/);
  await page.unroute('**/assets/tally-*.js');
  await page.getByRole('button', { name: 'Retry page' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tally');
  expect(await page.evaluate(() => (globalThis as typeof globalThis & { shellSentinel: string }).shellSentinel)).toBe('retained');
  await expect(page.getByRole('main')).toBeFocused();
});

test('shortcuts respect edit/composition and opt-out while ordinary navigation remains usable', async ({ page }) => {
  await page.goto('/catalogue');
  const search = page.getByRole('textbox', { name: 'Search demo catalogue' });
  await search.focus();
  for (const key of ['?', 'Control+b', 'Control+k']) await page.keyboard.press(key);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Open command palette' }).focus();
  const untouched = await page.evaluate(() => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, isComposing: true, cancelable: true, bubbles: true })));
  expect(untouched).toBe(true);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Keyboard shortcuts' }).click();
  await page.getByRole('checkbox', { name: 'Enable navigation shortcuts' }).uncheck();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Keyboard shortcuts' })).toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('link', { name: 'Settings', exact: true }).focus();
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Settings');
  await page.getByRole('button', { name: 'Open command palette' }).click();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeFocused();
});

test('a page render exception is sanitized and cannot discard the shell', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.goto('/settings');
  await page.route('**/assets/tally-*.js', (route) => route.fulfill({ contentType: 'text/javascript', body: 'export function Component() { throw new Error("PRIVATE_RENDER_CANARY"); }' }));
  await page.getByRole('link', { name: 'Tally', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'This page couldn’t load.' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('PRIVATE_RENDER_CANARY');
  await page.getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catalogue');
});

test('a late module response cannot replace the newly selected route', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.goto('/settings');
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/assets/tally-*.js', async (route) => { await gate; await route.continue(); });
  await page.getByRole('link', { name: 'Tally', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Loading page' })).toBeVisible();
  await page.getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catalogue');
  const response = page.waitForResponse('**/assets/tally-*.js');
  release();
  await response;
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catalogue');
  await expect(page).toHaveURL(/\/catalogue$/);
});

test('reduced-motion shell and healthy refresh preserve keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByText('API responding · database reachable', { exact: true })).toBeVisible();
  const refresh = page.getByRole('button', { name: 'Refresh', exact: true });
  await refresh.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('API responding · database reachable', { exact: true })).toBeVisible();
  await expect(refresh).toBeFocused();
  await expect(page.getByRole('status', { name: 'Opening workspace' })).toHaveCount(0);
});

test('shell distinguishes an unprovisioned database from an unhealthy one outside Dashboard', async ({ page, request }) => {
  const ready = healthSchema.parse(await (await request.get('/health')).json());
  for (const [status, message] of [['not_configured', 'D1 is not configured'], ['error', 'D1 probe failed']] as const) {
    await page.route('**/health', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({
      ...ready, status: 'degraded', readiness: 'unready', database: { status, probe: 'SELECT 1' },
    }) }));
    await page.goto('/settings');
    await expect(page.getByRole('status', { name: 'Runtime environment' })).toContainText(message);
    await page.unroute('**/health');
  }
});