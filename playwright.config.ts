import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 120_000, // Global timeout for tests
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // actionTimeout: 15000,
    launchOptions: {
      slowMo: 1000,
    },
    video: {
      mode: 'on',
      size: { width: 640, height: 480 }
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev:e2e',
    port: 3000,
    reuseExistingServer: false,
    timeout: 10000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 