import { test, expect } from '@playwright/test';
import { FlashcardGenerationPage } from './pages/flashcard-generation-page';
import { createAuthenticatedContext } from './utils/browser-context';
import { readTestDataFile } from './utils/file-utils';

test.describe('Flashcard generation functionality', () => {
  const username = process.env.E2E_USERNAME || '';
  const password = process.env.E2E_PASSWORD || '';
  
  // Test with authenticated context
  test.beforeAll(async ({ browser }) => {
    // Create authenticated context that will be used for all tests
    test.setTimeout(30000); // Increase timeout for authentication
  });
  
  test('should navigate to flashcard generation page when logged in', async ({ browser }) => {
    const page = await createAuthenticatedContext(browser, username, password);
    await page.goto('/flashcards/generate');
    const generationPage = new FlashcardGenerationPage(page);
    
    // Check if the form is visible
    await expect(generationPage.sourceTextInput).toBeVisible();
    await expect(generationPage.maxFlashcardsInput).toBeVisible();
    await expect(generationPage.generateButton).toBeVisible();
    
    await page.close();
  });
  
   test('should validate input requirements', async ({ browser }) => {
    const page = await createAuthenticatedContext(browser, username, password);

    await page.goto('/flashcards/generate');
    const generationPage = new FlashcardGenerationPage(page);
    
    // Try with empty text (generate button should be disabled)
    await expect(generationPage.generateButton).toBeDisabled();
    
    // Try with short text (less than 1000 characters)
    await generationPage.fillSourceText('This is a short text.');
    await expect(generationPage.generateButton).toBeDisabled();
    
    // Try with invalid max flashcards value
    await generationPage.fillSourceText('A'.repeat(1000)); // Valid text length
    await generationPage.setMaxFlashcards(0); // Invalid max flashcards
    await expect(generationPage.generateButton).toBeDisabled();
    
    await page.close();
  });
  
  test('should generate flashcards and allow selection', async ({ browser }) => {
    const page = await createAuthenticatedContext(browser, username, password);
    await page.goto('/flashcards/generate');
    const generationPage = new FlashcardGenerationPage(page);

    // Read sample text from file
    const sampleText = readTestDataFile('sample-text.txt');
    
    // Fill form with valid data
    await generationPage.fillSourceText(sampleText);
    await generationPage.setMaxFlashcards(5);
    
    // Start generation
    await generationPage.generateFlashcards();
    
    // Wait for generation to complete (this might take time)
    await page.waitForSelector('[data-testid="flashcards-candidate-list"]', { timeout: 60000 });
    
    // Check that flashcards were generated
    await expect(generationPage.flashcardsList).toBeVisible();
    
    // Select a flashcard 
    await generationPage.selectFlashcard(0);
    
    // Check that selected count updates
    const selectedCountText = await generationPage.flashcardsSelectedCount.textContent();
    expect(selectedCountText).toContain('Wybrano 1');
    
    // Save selected flashcards
    await generationPage.saveSelectedFlashcards();
    
    // Wait for success toast or redirection
    await page.waitForTimeout(2000); // Wait for any post-save operations
    await page.close();
  });
}); 