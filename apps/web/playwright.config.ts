import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'E2E_AUTH_BYPASS=1 pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'], browserName: 'chromium' },
    },
    {
      name: 'iphone-13',
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'], browserName: 'chromium' },
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Mini'], browserName: 'chromium' },
    },
  ],
});
