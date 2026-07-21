import { defineConfig, devices } from '@playwright/test';

const remoteBaseUrl = process.env.E2E_WEB_BASE_URL?.trim();

export default defineConfig({
  testDir: './e2e-auth',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: remoteBaseUrl || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: remoteBaseUrl
    ? undefined
    : [
        {
          command: 'pnpm --filter @iatron/api dev',
          url: 'http://127.0.0.1:8080/health',
          reuseExistingServer: false,
          timeout: 120_000,
          cwd: '../..',
        },
        {
          command: 'pnpm dev --hostname 127.0.0.1',
          url: 'http://127.0.0.1:3000',
          reuseExistingServer: false,
          timeout: 120_000,
        },
      ],
  projects: [{ name: 'real-supabase', use: { ...devices['Desktop Chrome'] } }],
});
