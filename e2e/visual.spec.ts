import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Visual regression tests', () => {
  test('homepage visual comparison', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('homepage.png');
  });
}); 