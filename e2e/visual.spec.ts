import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';

// Visual regression test for login page
test('homepage visual comparison', async ({ page }) => {
  // Set a reasonable timeout for the entire test
  test.setTimeout(60000);
  
  // Go to login page directly
  console.log('Navigating to homepage...');
  await page.goto('/auth/login', { waitUntil: 'networkidle' });
  console.log('Navigation complete.');
  
  // Create home page object
  const homePage = new HomePage(page);
  
  // Verify basic page loading
  console.log('Checking if page title is visible...');
  await expect(homePage.pageTitle).toBeVisible({ timeout: 10000 });
  console.log('Page title is visible.');
  
  // Take a screenshot without comparison first
  console.log('Taking screenshot...');
  await page.screenshot({ path: './homepage-actual.png' });
  console.log('Screenshot taken.');
  
  // Finally try the visual comparison
  console.log('Performing visual comparison...');
  await expect(page).toHaveScreenshot('login-page.png', { 
    timeout: 15000,
    threshold: 0.3, // Increased threshold to allow for more visual differences
    maxDiffPixelRatio: 0.02 // Allow up to 2% of pixels to differ
  });
  console.log('Visual comparison complete.');
});

// Basic login page test
test('basic login page test', async ({ page }) => {
  await page.goto('/auth/login', { waitUntil: 'networkidle' });
  const homePage = new HomePage(page);
  await expect(homePage.pageTitle).toBeVisible({ timeout: 10000 });
}); 