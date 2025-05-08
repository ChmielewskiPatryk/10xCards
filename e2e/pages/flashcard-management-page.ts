import type { Page } from '@playwright/test';

export class FlashcardManagementPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async goto() {
    await this.page.goto('/flashcards');
  }

  // Selectors
  get flashcardsList() {
    return this.page.getByTestId('flashcards-list');
  }

  get flashcardItems() {
    return this.page.getByTestId(/^flashcard-front/);
  }

  get editButtons() {
    return this.page.getByTestId(/^flashcard-edit-button-/);
  }

  get deleteButtons() {
    return this.page.getByTestId(/^flashcard-delete-button-/);
  }

  get confirmDeleteButton() {
    return this.page.getByTestId('confirm-dialog-button');
  }

  get cancelDeleteButton() {
    return this.page.getByTestId('cancel-delete-button');
  }

  // Actions
  async editFlashcard(index: number) {
    await this.editButtons.nth(index).click();
  }

  async deleteFlashcard(index: number) {
    await this.deleteButtons.nth(index).click();
  }

  async confirmDelete() {
    await this.confirmDeleteButton.click();
  }

  async cancelDelete() {
    await this.cancelDeleteButton.click();
  }

  async getFlashcardsCount() {
    return await this.flashcardItems.count();
  }

  // Edit form selectors
  get editDialog() {
    return this.page.getByTestId('edit-flashcard-dialog');
  }

  get editFrontContent() {
    return this.page.getByTestId('edit-front-content');
  }

  get editBackContent() {
    return this.page.getByTestId('edit-back-content');
  }

  get editSaveButton() {
    return this.page.getByTestId('edit-save-button');
  }

  get editCancelButton() {
    return this.page.getByTestId('edit-cancel-button');
  }

  get frontContentError() {
    return this.page.getByTestId('front-content-error');
  }

  get backContentError() {
    return this.page.getByTestId('back-content-error');
  }

  // Edit actions
  async fillEditForm(frontContent: string, backContent: string) {
    await this.editFrontContent.fill(frontContent);
    await this.editBackContent.fill(backContent);
  }

  async saveEdit() {
    await this.editSaveButton.click();
  }

  async cancelEdit() {
    await this.editCancelButton.click();
  }

  async getFlashcardContent(index: number) {
    const flashcard = this.flashcardItems.nth(index);
    const id = await flashcard.getAttribute('data-testid').then(value => value?.replace('flashcard-', ''));
    if (!id) throw new Error('Could not find flashcard ID');
    
    const front = await this.page.getByTestId(`flashcard-front-${id}`).textContent();
    const back = await this.page.getByTestId(`flashcard-back-${id}`).textContent();
    return { front, back };
  }
} 