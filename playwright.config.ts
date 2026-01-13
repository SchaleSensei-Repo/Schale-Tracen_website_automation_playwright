import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;          // true on GitHub Actions
const isVisual = !!process.env.VISUAL;  // optional: force headed locally

export default defineConfig({
  testDir: './tests',
  workers: isCI ? 2 : (isVisual ? 1 : undefined),
  retries: isCI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: 1, // hosted network hiccups happen
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://schale-tracen.my.id',
    headless: isCI ? true : !isVisual,
    slowMo: isVisual ? 250 : 0,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
reporter: [['html', { open: 'never' }]],
});
