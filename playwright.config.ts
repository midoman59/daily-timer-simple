import { defineConfig, devices } from '@playwright/test';

// Tests E2E sur le build de production (base href /daily-timer-simple/), servi par e2e/serve-dist.mjs.
// Build préalable : npx ng build --configuration production --base-href "/daily-timer-simple/"
// En local, le navigateur Chrome installé est utilisé ; en CI, celui de Playwright.
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:4300/daily-timer-simple/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node e2e/serve-dist.mjs',
    url: 'http://localhost:4300/daily-timer-simple/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
});
