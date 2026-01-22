import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Optional: block wttr.in (not on tools page, but harmless if you reuse helpers globally)
  await page.route('**://wttr.in/**', route => route.abort());
  await page.route('**/wttr.in/**', route => route.abort());
});

test('random React tool loads and runs', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.goto('/tools/', { waitUntil: 'domcontentloaded' });

  // Your list is #toolList and each tool is rendered like: "[react] <a href=...>Title</a>" :contentReference[oaicite:1]{index=1}
  const toolList = page.locator('#toolList');
  await expect(toolList).not.toContainText(/Loading tools/i);

  const reactItems = toolList.locator('li.tool-item', { hasText: /\[react\]/i });
  const count = await reactItems.count();
  expect(count).toBeGreaterThan(0);

  const idx = Math.floor(Math.random() * count);
  const chosen = reactItems.nth(idx).locator('a');
  const toolName = (await chosen.textContent())?.trim() || `(react tool index ${idx})`;

  const [nav] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    chosen.click(),
  ]);

  expect(nav).toBeTruthy();
  expect(nav!.status()).toBeLessThan(400);

  // "Loaded properly" = body visible + some interactive element exists.
  await expect(page.locator('body')).toBeVisible();
  await expect(page.locator('#root')).toBeVisible({ timeout: 30_000 });

  expect(pageErrors, `Page errors while loading ${toolName}:\n${pageErrors.join('\n')}`).toHaveLength(0);

  console.log(`the React tools of ${toolName} is successfully loaded and running`);
});
