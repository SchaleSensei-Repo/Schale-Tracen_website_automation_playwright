import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 1, // hosted network hiccups happen
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://schale-tracen.my.id',
    headless: false,
    slowMo: 400,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
