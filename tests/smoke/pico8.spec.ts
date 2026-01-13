import { test, expect } from '@playwright/test';

test('random Pico-8 game loads and runs', async ({ page }) => {
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

  // 4) Collect pico8 entries
  const pico8Lis = gameList.locator('li', { hasText: /\[pico8\]/i });
  const pico8Count = await pico8Lis.count();
  expect(pico8Count).toBeGreaterThan(0);

  // 5) Pick random pico8 game
  const randomIndex = Math.floor(Math.random() * pico8Count);
  const chosenLi = pico8Lis.nth(randomIndex);
  const chosenLink = chosenLi.locator('a');

  const gameName = (await chosenLink.textContent())?.trim() || `(pico8 index ${randomIndex})`;

  // 6) Click and capture navigation response
  const [navResponse] = await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    chosenLink.click(),
  ]);

  expect(navResponse).toBeTruthy();
  expect(navResponse!.status()).toBeLessThan(400);

  // 7) Pico-8 "boot" click: canvas exists but may be hidden until user gesture
  const canvas = page.locator('#canvas, canvas').first();

  // Ensure the canvas is attached to DOM (even if hidden)
  await expect(canvas).toHaveCount(1, { timeout: 30_000 });

  // Try a few clicks to start the player
  for (let i = 0; i < 5; i++) {
    if (await canvas.isVisible()) break;

    // Click the canvas area if it has a box; otherwise click center of page
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    } else {
      await page.mouse.click(400, 300);
    }

    // Small pause to allow the player to swap from poster -> running canvas
    await page.waitForTimeout(300);
  }

  // 7b) Assertion: canvas must become visible after boot gesture
  await expect(canvas).toBeVisible({ timeout: 15_000 });

  // 7c) No uncaught runtime errors
  expect(
    pageErrors,
    `Page errors found while loading ${gameName}:\n${pageErrors.join('\n')}`
  ).toHaveLength(0);

  console.log(`the Pico-8 game : ${gameName} is successfully loaded and running`);
});
