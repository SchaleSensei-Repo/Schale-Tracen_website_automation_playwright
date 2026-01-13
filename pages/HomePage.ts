import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly navGames: Locator;
  readonly siteSearch: Locator;
  readonly wttrLocation: Locator;
  readonly wttrFrame: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navGames = page.getByRole('link', { name: 'Games' });
    this.siteSearch = page.locator('#siteSearch');
    this.wttrLocation = page.locator('#wttrLocation');
    this.wttrFrame = page.locator('#wttrFrame');
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: /Welcome/i })).toBeVisible();
  }

  async search(text: string) {
    await this.siteSearch.fill(text);
  }

  async clearSearchWithEsc() {
    await this.siteSearch.press('Escape');
  }

  async selectWeather(locationLabel: string) {
    await this.wttrLocation.selectOption({ label: locationLabel });
  }

  async weatherSrc() {
    return await this.wttrFrame.getAttribute('src');
  }
}
