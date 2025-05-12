import { test } from "@playwright/test";
import { ManualFlashcardPage } from "./pages/manual-flashcard-page";
import { expect } from "@playwright/test";

test.describe("Manual Flashcard Creation", () => {
  let manualFlashcardPage: ManualFlashcardPage;

  test.beforeEach(async ({ page }) => {
    // Setup authentication
    const username = process.env.E2E_USERNAME || "";
    const password = process.env.E2E_PASSWORD || "";

    // Login before each test
    await page.goto("/auth/login");
    await page.getByTestId("email-input").fill(username);
    await page.getByTestId("password-input").fill(password);
    await page.getByTestId("login-button").click();
    await page.waitForURL("");

    // Initialize page object
    manualFlashcardPage = new ManualFlashcardPage(page);
    await manualFlashcardPage.goto();
  });

  test("should successfully create a flashcard", async () => {
    // Fill form with valid data
    await manualFlashcardPage.fillFlashcardForm("What is the capital of France?", "Paris");

    // Submit form
    await manualFlashcardPage.submitForm();

    // Confirm in dialog
    await manualFlashcardPage.confirmSave();

    // Verify success
    await manualFlashcardPage.expectSuccessToast();
    await manualFlashcardPage.expectFormToBeEmpty();
  });

  test("should clear form when clicking clear button", async () => {
    // Fill form
    await manualFlashcardPage.fillFlashcardForm("Test front content", "Test back content");

    // Clear form
    await manualFlashcardPage.clearForm();

    // Verify form is empty
    await manualFlashcardPage.expectFormToBeEmpty();
  });

  test("should cancel flashcard creation", async () => {
    // Fill form
    await manualFlashcardPage.fillFlashcardForm("Test front content", "Test back content");

    // Submit and cancel in dialog
    await manualFlashcardPage.submitForm();
    await manualFlashcardPage.cancelSave();

    // Verify form still contains data
    await expect(manualFlashcardPage.frontContentInput).toHaveValue("Test front content");
    await expect(manualFlashcardPage.backContentInput).toHaveValue("Test back content");
  });

  test("should validate minimum content length", async () => {
    await manualFlashcardPage.expectSaveButtonState(false);

    // Try with only front content
    await manualFlashcardPage.fillFlashcardForm("What is the capital of France?", "");
    await manualFlashcardPage.expectSaveButtonState(false);

    // Try with only back content
    await manualFlashcardPage.fillFlashcardForm("", "Paris");
    await manualFlashcardPage.expectSaveButtonState(false);
  });

  test("should validate maximum content length", async () => {
    const longText = "A".repeat(201); // Exceeds 200 character limit

    // Try with too long front content
    await manualFlashcardPage.fillFlashcardForm(longText, "Valid back");
    await manualFlashcardPage.expectSaveButtonState(false);

    // Try with too long back content
    await manualFlashcardPage.fillFlashcardForm("Valid front", longText);
    await manualFlashcardPage.expectSaveButtonState(false);

    // Verify form accepts content at exactly 200 characters
    const validLongText = "A".repeat(200);
    await manualFlashcardPage.fillFlashcardForm(validLongText, validLongText);
    await manualFlashcardPage.expectSaveButtonState(true);
  });
});
