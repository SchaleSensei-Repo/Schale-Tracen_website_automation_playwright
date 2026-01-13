import { test, expect } from '@playwright/test';
import { GamesPage } from '../../pages/GamesPage';

test.describe('Games smoke', () => {
  test('games list loads', async ({ page }) => {
    const games = new GamesPage(page);
    await games.goto();

    // On hosted site we expect it to move past "Loading games…"
    await games.waitLoaded();

    // Basic assertions: items and links exist
    const first = games.gameList.locator('li').first();
    await expect(first).toBeVisible();
    await expect(first.locator('a')).toHaveAttribute('href', /.+/);

  });
});
