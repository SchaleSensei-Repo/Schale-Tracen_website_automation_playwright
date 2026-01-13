import { test, expect } from '@playwright/test';

test('random React game loads and runs', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  // 1) Start at main menu
  await page.goto('/');

  // 2) Go to Games
  await page.getByRole('link', { name: /^Games$/ }).click();
  await page.waitForURL(/\/games\/$/, { waitUntil: 'domcontentloaded' });

  // 3) Wait for the list to populate
  const gameList = page.locator('#gameList');
  await expect(gameList).not.toContainText(/Loading games/i);

  // 4) Collect React entries
  const reactLis = gameList.locator('li', { hasText: /\[react\]/i });
  const reactCount = await reactLis.count();
  expect(reactCount).toBeGreaterThan(0);

  // 5) Pick random React game
  const randomIndex = Math.floor(Math.random() * reactCount);
  const chosenLi = reactLis.nth(randomIndex);
  const chosenLink = chosenLi.locator('a');

  const gameName = (await chosenLink.textContent())?.trim() || `(react index ${randomIndex})`;

  // 6) Click and capture navigation response
  const [navResponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    chosenLink.click(),
  ]);

  expect(navResponse).toBeTruthy();
  expect(navResponse!.status()).toBeLessThan(400);

  // 7) "Running" assertion for React games:
  // Assert that page has rendered some meaningful app content.
  // Most React games will have a body with visible text or interactive elements.
  await expect(page.locator('body')).toBeVisible();

  // Optional: click once to ensure any "start" overlay is dismissed (harmless if none)
  await page.mouse.click(400, 300);

  // A practical “not blank” check: body should contain some non-empty text
  const bodyText = (await page.textContent('body'))?.trim() || '';
  expect(bodyText.length).toBeGreaterThan(0);

  // 7c) No uncaught runtime errors
  expect(
    pageErrors,
    `Page errors found while loading ${gameName}:\n${pageErrors.join('\n')}`
  ).toHaveLength(0);

  console.log(`the React game : ${gameName} is successfully loaded and running`);
});
