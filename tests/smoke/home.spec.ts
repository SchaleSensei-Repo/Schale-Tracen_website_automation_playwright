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

  test('search FMHY filters results correctly', async ({ page }) => {
    // Go to home page
    await page.goto('/');

    // Locate the search input
    const searchInput = page.locator('#siteSearch');

    // Type "FMHY"
    await searchInput.fill('FMHY');

    // Assertion 1: FMHY must be visible
    const fmhyItem = page.getByText('FMHY', { exact: false });
    await expect(fmhyItem).toBeVisible();

    // Assertion 2: Wotaku must NOT be visible
    const wotakuItem = page.getByText('Wotaku', { exact: false });
    await expect(wotakuItem).toBeHidden();

    // Console success message
    console.log('The Search function is working');
  });

  test('weather dropdown updates wttr.in module to Sagami-Ono', async ({ page }) => {
    // Open main menu
    await page.goto('/');

    // Locate dropdown and iframe
    const locationDropdown = page.locator('#wttrLocation');
    const weatherFrame = page.locator('#wttrFrame');

    // Change location to Sagami-ono
    await locationDropdown.selectOption({ label: 'Sagami-Ono' });

    // Get iframe src
    const frameSrc = await weatherFrame.getAttribute('src');

    // Assertion: iframe src must contain "Sagami-ono"
    expect(frameSrc).toBeTruthy();
    expect(frameSrc!).toContain('Sagami-Ono');

    // Success log
    console.log('The Weather wttr.in module is working');
  });

  test('FreshRSS login page is reachable from main menu (no 4xx/5xx)', async ({ page }) => {
    await page.goto('/');

    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.request().isNavigationRequest() && r.url().includes('/freshrss/'),
        { timeout: 30_000 }
      ),
      page.getByRole('link', { name: /^News$/ }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);
    await expect(page.getByText(/FreshRSS/i)).toBeVisible();

    console.log('The FreshRSS module is working');
  });
});
