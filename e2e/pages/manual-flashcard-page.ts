import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class ManualFlashcardPage {
  readonly page: Page;
  readonly frontContentInput: Locator;
  readonly backContentInput: Locator;
  readonly clearButton: Locator;
  readonly saveButton: Locator;
  readonly confirmDialogConfirmButton: Locator;
  readonly confirmDialogCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.frontContentInput = page.getByTestId('front-content-input');
    this.backContentInput = page.getByTestId('back-content-input');
    this.clearButton = page.getByTestId('clear-button');
    this.saveButton = page.getByTestId('save-button');
    this.confirmDialogConfirmButton = page.getByTestId('confirm-dialog-button');
    this.confirmDialogCancelButton = page.getByTestId('cancel-dialog-button');
  }

  async goto() {
    await this.page.goto('/flashcards/new');
    await this.page.waitForLoadState('networkidle');
  }

  async fillFlashcardForm(frontContent: string, backContent: string) {
    await this.frontContentInput.fill(frontContent);
    await this.backContentInput.fill(backContent);
  }

  async clearForm() {
    await this.clearButton.click();
  }

  async submitForm() {
    await this.saveButton.click();
  }

  async confirmSave() {
    await this.confirmDialogConfirmButton.click();
  }

  async cancelSave() {
    await this.confirmDialogCancelButton.click();
  }

  async expectFormToBeEmpty() {
    await expect(this.frontContentInput).toHaveValue('');
    await expect(this.backContentInput).toHaveValue('');
  }

  async expectSaveButtonState(enabled: boolean) {
    if (enabled) {
      await expect(this.saveButton).toBeEnabled();
    } else {
      await expect(this.saveButton).toBeDisabled();
    }
  }

  async expectSuccessToast() {
    await expect(this.page.getByText('Fiszka została pomyślnie zapisana')).toBeVisible();
  }

  async expectErrorToast(errorMessage?: string) {
    if (errorMessage) {
      await expect(this.page.getByText(errorMessage)).toBeVisible();
    } else {
      await expect(this.page.getByText('Wystąpił błąd')).toBeVisible();
    }
  }
} 