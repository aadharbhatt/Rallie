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
  await expect(page.getByRole('heading', { name: 'Ready when you are.' })).toBeVisible();
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
  await expect(page.getByRole('button', { name: 'Inspect Arc basin mixer', exact: true })).toBeVisible();
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
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(search).toBeFocused();
});

test('headerless workspace keeps the page finder in expanded, collapsed, and mobile sidebars', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const sidebar = page.getByRole('complementary');
  const finder = sidebar.getByRole('button', { name: 'Open command palette' });
  await expect(page.getByRole('banner')).toHaveCount(0);
  await expect(finder).toBeVisible();
  await expect(finder.locator('span')).toBeVisible();
  expect((await page.getByRole('main').boundingBox())!.y).toBe(0);
  await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(finder).toBeVisible();
  await expect(finder.locator('span')).not.toBeVisible();
  await finder.click();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(finder).toBeFocused();
  await sidebar.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(finder.locator('span')).toBeVisible();
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(finder).toBeVisible();
  await expect(finder.locator('span')).not.toBeVisible();
  await finder.click();
  await expect(page.getByRole('combobox', { name: 'Find a page' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(finder).toBeFocused();
});

test('page location lives in the footer with one highlighted shortcuts control', async ({ page }) => {
  await page.goto('/catalogue?q=robe');
  const footer = page.getByRole('contentinfo');
  const location = footer.getByRole('navigation', { name: 'Current page' }).getByRole('link');
  const shortcuts = page.getByRole('button', { name: 'Keyboard shortcuts', exact: true });
  const activeNav = page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Catalogue', exact: true });
  await expect(page.getByRole('banner')).toHaveCount(0);
  await expect(page.getByRole('complementary').getByRole('button', { name: /Keyboard/ })).toHaveCount(0);
  await expect(footer).not.toContainText('Local fixture data');
  await expect(footer).not.toContainText('Nothing saved or sent');
  await expect(shortcuts).toHaveCount(1);
  await expect(location).toContainText('Catalogue');
  await expect(location).toHaveAttribute('href', '/catalogue?q=robe');
  await expect(location).toHaveAttribute('aria-current', 'page');
  await expect(activeNav).toHaveCSS('display', 'flex');
  await expect(activeNav).toHaveCSS('background-color', 'rgb(40, 42, 44)');
  for (const control of [location, shortcuts]) {
    await control.hover();
    await expect(control).toHaveCSS('background-color', 'rgb(40, 42, 44)');
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS('background-color', 'rgb(40, 42, 44)');
  }
  await shortcuts.click();
  const dialog = page.getByRole('dialog', { name: 'A few useful shortcuts' });
  const close = dialog.getByRole('button', { name: 'Close dialog' });
  await expect(dialog).toHaveAttribute('aria-describedby', /.+/);
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(shortcuts).toBeFocused();
  await shortcuts.click();
  await page.locator('.dialog-overlay').click({ position: { x: 2, y: 2 } });
  await expect(dialog).not.toBeVisible();
  await expect(shortcuts).toBeFocused();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(location).toContainText('Settings');
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(shortcuts).toBeVisible();
  expect(await shortcuts.evaluate((element) => getComputedStyle(element).fontSize)).toBe('12px');
  const [pathBox, shortcutBox] = await Promise.all([location.boundingBox(), shortcuts.boundingBox()]);
  expect(pathBox!.x + pathBox!.width).toBeLessThanOrEqual(shortcutBox!.x);
});

test('Radix navigation tooltips and quotation tabs support keyboard use', async ({ page }) => {
  await page.goto('/quotations');
  const quantity = page.getByRole('spinbutton', { name: 'Quantity', exact: true });
  const first = page.getByRole('tab', { name: 'Sample bathroom' });
  const second = page.getByRole('tab', { name: 'Sample accessories' });
  await quantity.fill('3');
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Sample accessories' })).toBeVisible();
  await expect(quantity).toHaveValue('2');
  await quantity.fill('4');
  await second.focus();
  await page.keyboard.press('Home');
  await expect(first).toHaveAttribute('aria-selected', 'true');
  await expect(quantity).toHaveValue('3');
  await first.focus();
  await page.keyboard.press('End');
  await expect(second).toHaveAttribute('aria-selected', 'true');
  await expect(quantity).toHaveValue('4');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Catalogue', exact: true }).focus();
  await expect(page.getByRole('tooltip', { name: 'Catalogue', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('tooltip')).not.toBeVisible();
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
  await page.getByText('Connection details', { exact: true }).click();
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

test('desktop sidebar toggle retains the current quotation edits', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/quotations');
  await page.getByLabel('Quantity', { exact: true }).fill('3');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.locator('.app-shell')).toHaveClass(/sidebar-collapsed/);
  await expect(page.getByTestId('quote-total')).toHaveText('₹11,475.00');
  await page.getByRole('button', { name: 'Expand sidebar' }).press('Control+b');
  await expect(page.locator('.app-shell')).not.toHaveClass(/sidebar-collapsed/);
  await expect(page.getByLabel('Quantity', { exact: true })).toHaveValue('3');
  await page.getByLabel('Quantity', { exact: true }).press('Control+b');
  await expect(page.locator('.app-shell')).not.toHaveClass(/sidebar-collapsed/);
});

test('product inspector preserves filters and restores focus on close', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/catalogue');
  const search = page.getByRole('textbox', { name: 'Search demo catalogue' });
  await search.fill('DEMO-BM-101');
  const product = page.getByRole('button', { name: 'Inspect Arc basin mixer', exact: true });
  await product.click();
  const inspector = page.getByRole('complementary', { name: 'Product inspector' });
  await expect(inspector).toBeVisible();
  await expect(inspector).toContainText('₹4,250.00');
  await inspector.getByRole('button', { name: 'Close product inspector' }).focus();
  await page.keyboard.press('Escape');
  await expect(inspector).not.toBeVisible();
  await expect(product).toBeFocused();
  await expect(search).toHaveValue('DEMO-BM-101');
});

test('dashboard product search persists in the catalogue URL and supports browser history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Find a sample product' }).fill('DEMO-BM-101');
  await page.getByRole('button', { name: 'Search catalogue', exact: true }).click();
  await expect(page).toHaveURL(/\/catalogue\?q=DEMO-BM-101$/);
  await expect(page.getByRole('status')).toHaveText('1 demo product');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Search demo catalogue' })).toHaveValue('DEMO-BM-101');
  await expect(page.getByRole('button', { name: 'Inspect Arc basin mixer', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('searchbox', { name: 'Find a sample product' })).toBeVisible();
  await page.getByRole('button', { name: 'Search catalogue', exact: true }).click();
  await expect(page).toHaveURL(/\/catalogue$/);
  await expect(page.getByRole('status')).toHaveText('6 demo products');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('link', { name: /Rain overhead shower Chrome/ }).click();
  await expect(page).toHaveURL(/\/catalogue\?q=DEMO-SH-204$/);
  await expect(page.getByRole('status')).toHaveText('1 demo product');
});

test('blueprint typography and start-page geometry stay consistent', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '36px');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-weight', '400');
  await expect(page.getByRole('heading', { name: 'Sample products' })).toHaveCSS('font-size', '20px');
  await expect(page.locator('.workspace-context')).toHaveCSS('font-size', '12px');
  for (const label of ['Dashboard', 'Catalogue', 'Quotations', 'Tally', 'Settings']) {
    await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: label, exact: true })).toHaveCSS('font-size', '14px');
  }
  await expect(page.locator('.sidebar')).toHaveCSS('width', '248px');
  await expect(page.locator('.workspace-search')).toHaveCSS('border-radius', '28px');
  await expect(page.locator('.workspace-search')).toHaveCSS('min-height', '72px');
  const searchWidth = await page.locator('.workspace-search').evaluate((element) => element.getBoundingClientRect().width);
  expect(searchWidth).toBeLessThanOrEqual(880);
  await expect(page.locator('.overview-metrics')).toHaveCount(0);
  await expect(page.locator('.page-heading .eyebrow')).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Catalogue', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS('font-size', '32px');
  const tableWidth = await page.locator('.table-panel').evaluate((element) => element.getBoundingClientRect().width);
  expect(tableWidth).toBeGreaterThan(880);
});

test('connection diagnostics are available without overwhelming the default view', async ({ page }) => {
  await page.route('**/health', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({
    service: 'rallie-api', stage: 'foundation', status: 'degraded', checkedAt: new Date().toISOString(),
    database: { status: 'error', probe: 'SELECT 1' },
    bindings: { documents: 'not_configured', assets: 'configured', ingestionWorkflow: 'not_configured', tallyConnections: 'not_configured' },
  }) }));
  await page.goto('/');
  await expect(page.getByText('API responding · database needs attention', { exact: true })).toBeVisible();
  await expect(page.getByText('Probe failed', { exact: true })).not.toBeVisible();
  await page.getByText('Connection details', { exact: true }).click();
  await expect(page.getByText('Probe failed', { exact: true })).toBeVisible();
});

test('workbench routes reflow without page or main horizontal overflow', async ({ page }) => {
  for (const width of [320, 390, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/catalogue', '/quotations', '/tally', '/settings']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const noOverflow = await page.evaluate(() => {
        const main = document.querySelector('main')!;
        return document.documentElement.scrollWidth <= window.innerWidth && main.scrollWidth <= main.clientWidth;
      });
      expect(noOverflow, `${path} at ${width}px`).toBe(true);
    }
  }
});