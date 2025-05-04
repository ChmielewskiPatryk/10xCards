import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  // Navigate to the root URL
  await page.goto('/');
  
  // Take a screenshot of whatever is displayed
  await page.screenshot({ path: 'homepage-screenshot.png' });
  
  // Updated assertion to expect redirection to login page
  await expect(page).toHaveURL(/.*\/auth\/login$/);
}); 