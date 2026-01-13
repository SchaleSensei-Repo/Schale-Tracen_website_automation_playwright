import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('Home smoke', () => {
  test('home loads and shows content', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    // sanity: Websites + Weather sections exist on the home page
    await expect(page.getByRole('heading', { name: /Websites/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Weather/i })).toBeVisible();
  });

  test('weather dropdown updates iframe src', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    const before = await home.weatherSrc();
    await home.selectWeather('Tokyo');
    const after = await home.weatherSrc();

    expect(before).not.toEqual(after);
    expect(after || '').toContain('wttr.in'); // cross-origin: only assert src
  });

  test('nav to games works', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.navGames.click();
    await expect(page).toHaveURL(/\/games\/$/);
  });
});
