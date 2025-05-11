import { chromium } from "@playwright/test";
import type { Browser, BrowserContext } from "@playwright/test";

export async function createIsolatedContext(browser: Browser, storageState?: string): Promise<BrowserContext> {
  return browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState,
  });
}

export async function createAuthenticatedContext(browser: Browser, email: string, password: string): Promise<Page> {
  const context = await createIsolatedContext(browser);
  const page = await context.newPage();

  // Navigate to login page
  await page.goto("/auth/login");
  await page.waitForTimeout(2000);
  // Fill login form
  await page.getByTestId("email-input").click();
  await page.getByTestId("email-input").fill(email);

  await page.getByTestId("password-input").click();
  await page.getByTestId("password-input").fill(password);

  await page.click("h1");

  // Submit form
  await page.getByTestId("login-button").click();
  await page.waitForTimeout(2000);
  // Wait for redirect after successful login
  await page.waitForURL("");

  return page;
}
