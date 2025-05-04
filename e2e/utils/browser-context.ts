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
  
  // Implementation would depend on your app's authentication flow
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for authentication to complete
  await page.waitForURL('/dashboard');
  
  // Close the page but keep the authenticated context
  await page.close();
  
  return context;
} 