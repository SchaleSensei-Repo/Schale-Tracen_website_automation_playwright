import { Page, Locator, expect } from '@playwright/test';

export class GamesPage {
  readonly page: Page;
  readonly gameList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gameList = page.locator('#gameList');
  }

  async goto() {
    await this.page.goto('/games/');
    await expect(this.page.getByRole('heading', { name: /Games/i })).toBeVisible();
  }

  async waitLoaded() {
    // Wait until the loading text is gone
    await expect(this.gameList).not.toContainText(/Loading games/i);

    // Wait until at least one list item exists
    await expect(this.gameList.locator('li').first()).toBeVisible();
  }
}
