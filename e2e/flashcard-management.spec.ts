import { test, expect } from '@playwright/test';
import { FlashcardManagementPage } from './pages/flashcard-management-page';
import { ManualFlashcardPage } from './pages/manual-flashcard-page';

test.describe('Flashcard Management', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';
  
  let managementPage: FlashcardManagementPage;
  let manualPage: ManualFlashcardPage;

  test.beforeEach(async ({ page }) => {
    // Navigate to login page and authenticate before each test
    await page.goto('/auth/login');
    await page.waitForTimeout(3000);
    await page.getByTestId('email-input').fill(username);
    await page.waitForTimeout(3000);
    await page.getByTestId('password-input').fill(password);
    await page.waitForTimeout(3000);
    await page.getByTestId('login-button').click();
    await page.waitForTimeout(3000);
    await page.waitForURL(''); // Wait for redirect after login

    // Initialize page objects
    managementPage = new FlashcardManagementPage(page);
    manualPage = new ManualFlashcardPage(page);
  });

  test('should delete a flashcard', async () => {
    // First create a flashcard if none exists
    await manualPage.goto();
    await manualPage.fillFlashcardForm(
      'Test flashcard for deletion',
      'This flashcard will be deleted'
    );
    await manualPage.submitForm();
    await manualPage.confirmSave();
    await manualPage.expectSuccessToast();

    // Navigate to management page
    await managementPage.goto();
    
    // Get initial count of flashcards
    const initialCount = await managementPage.getFlashcardsCount();
    console.log(initialCount);
    
    // Delete the first flashcard
    await managementPage.deleteFlashcard(0);
    await managementPage.confirmDelete();
    
    // Verify flashcard was deleted
    const finalCount = await managementPage.getFlashcardsCount();
    expect(finalCount).toBe(initialCount - 1);
    console.log(finalCount);
  });

  test('should edit a flashcard', async () => {
    // First create a flashcard if none exists
    await manualPage.goto();
    await manualPage.fillFlashcardForm(
      'Original front content',
      'Original back content'
    );
    await manualPage.submitForm();
    await manualPage.confirmSave();
    await manualPage.expectSuccessToast();

    // Navigate to management page
    await managementPage.goto();
    
    // Edit the first flashcard
    await managementPage.editFlashcard(0);
    
    // Fill edit form with new content
    await managementPage.fillEditForm(
      'Updated front content',
      'Updated back content'
    );
    
    // Save the changes
    await managementPage.saveEdit();
    
  });

}); 