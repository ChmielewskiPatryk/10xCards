import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

test.describe('Example test suite', () => {
  test('should navigate to the home page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(homePage.pageTitle).toBeVisible();
  });
}); 