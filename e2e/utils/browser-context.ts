import { chromium } from '@playwright/test';
import type { Browser, BrowserContext } from '@playwright/test';

export async function createIsolatedContext(browser: Browser, storageState?: string): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState
  });
}

export async function createAuthenticatedContext(browser: Browser, email: string, password: string): Promise<BrowserContext> {
  const context = await createIsolatedContext(browser);
  const page = await context.newPage();
  
  // Navigate to login page
  await page.goto('/auth/login');
  
  // Fill login form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  
  // Submit form
  await page.click('[data-testid="login-button"]');
  
  // Wait for redirect after successful login
  await page.waitForURL('/');
  
  // Close the page but keep the authenticated context
  await page.close();
  
  return context;
} 