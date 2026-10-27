import { expect, test } from '@playwright/test';
import { healthSchema } from '../../packages/api-contracts/src/index';

test('real API health and foundation boundaries', async ({ page, request }) => {
  const response = await request.get('/health');
  expect(response.status()).toBe(200);
  const health = healthSchema.parse(await response.json());
  expect(health.database.status).toBe('ok');
  const missing = await request.get('/api/not-implemented', { headers: { Accept: 'text/html' } });
  expect(missing.status()).toBe(404);
  expect(await missing.json()).toMatchObject({ error: 'not_found' });
  await page.goto('/');
  await expect(page.getByText('Foundation preview', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A clear place to start.' })).toBeVisible();
  await expect(page.getByText('API responding · database reachable', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toHaveCount(0);
});

test('navigation, fixture search, quote tabs, and direct reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search demo catalogue' });
  await search.fill('DEMO-BM-101');
  await expect(page.getByRole('status')).toHaveText('1 demo product');
  await expect(page.getByRole('cell', { name: 'Arc basin mixer Arc collection' })).toBeVisible();
  await search.fill('nonexistent fixture');
  await expect(page.getByRole('heading', { name: 'No demo products found' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset filters' }).click();
  await expect(page.getByRole('status')).toHaveText('6 demo products');
  await page.getByRole('navigation').getByRole('link', { name: 'Quotations', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Sample bathroom' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('quote-total')).toHaveText('₹7,650.00');
  await page.getByLabel('Quantity', { exact: true }).fill('3');
  await expect(page.getByTestId('quote-total')).toHaveText('₹11,475.00');
  await page.getByRole('tab', { name: 'Sample bathroom' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Sample accessories' })).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Form towel rail');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('3');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Quotations', exact: true })).toBeVisible();
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('2');
  await page.getByRole('navigation').getByRole('link', { name: 'Tally', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The bridge comes later.' })).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByText('Not authenticated', { exact: true })).toBeVisible();
});

test('command palette and help support keyboard use and restore focus', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Open command palette' });
  await trigger.focus();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  const browserShortcutsUntouched = await trigger.evaluate((element) => ['f', 'r', 't', 'n', 'w', 'l'].every((key) => {
    const event = new KeyboardEvent('keydown', { key, ctrlKey: true, bubbles: true, cancelable: true });
    return element.dispatchEvent(event) && !event.defaultPrevented;
  }));
  expect(browserShortcutsUntouched).toBe(true);
  await page.keyboard.press('Meta+k');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('combobox', { name: 'Find a page' }).fill('catalogue');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/catalogue$/);
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
  await trigger.focus();
  await page.keyboard.press('?');
  await expect(page.getByRole('heading', { name: 'A few useful shortcuts' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  const search = page.getByRole('textbox', { name: 'Search demo catalogue' });
  await search.focus();
  await page.keyboard.press('?');
  await expect(search).toHaveValue('?');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('API loading, degraded health, failure, and retry are honest', async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/health', async (route) => {
    await gate;
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({
      service: 'rallie-api', stage: 'foundation', status: 'degraded', checkedAt: new Date().toISOString(),
      database: { status: 'error', probe: 'SELECT 1' },
      bindings: { documents: 'not_configured', assets: 'configured', ingestionWorkflow: 'not_configured', tallyConnections: 'not_configured' },
    }) });
  });
  await page.goto('/');
  await expect(page.getByRole('status', { name: 'Checking API health' })).toBeVisible();
  release();
  await expect(page.getByText('API responding · database needs attention', { exact: true })).toBeVisible();
  await expect(page.getByText('Probe failed', { exact: true })).toBeVisible();
  await page.unroute('**/health');
  await page.route('**/health', (route) => route.abort());
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('API unavailable');
  await expect(page.getByText('database reachable', { exact: false })).toHaveCount(0);
  await page.unroute('**/health');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByText('API responding · database reachable', { exact: true })).toBeVisible();
});

test('narrow viewport keeps navigation and page content usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catalogue');
  await expect(page.getByRole('heading', { name: 'Catalogue', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search demo catalogue' }).fill('robe hook');
  await expect(page.getByRole('status')).toHaveText('1 demo product');
  const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(noOverflow).toBe(true);
});