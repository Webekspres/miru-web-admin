import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3010',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.PLAYWRIGHT_SKIP_BUILD
      ? 'npx next start --hostname 127.0.0.1 --port 3010'
      : 'npm run build && npx next start --hostname 127.0.0.1 --port 3010',
    url: 'http://127.0.0.1:3010',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
