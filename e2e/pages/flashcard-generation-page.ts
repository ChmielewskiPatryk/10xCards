import type { Page, Locator } from "@playwright/test";

export class FlashcardGenerationPage {
  readonly page: Page;
  readonly sourceTextInput: Locator;
  readonly maxFlashcardsInput: Locator;
  readonly generateButton: Locator;
  readonly characterCount: Locator;
  readonly flashcardsList: Locator;
  readonly flashcardsSelectedCount: Locator;
  readonly saveSelectedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sourceTextInput = page.getByTestId("source-text-input");
    this.maxFlashcardsInput = page.getByTestId("max-flashcards-input");
    this.generateButton = page.getByTestId("generate-flashcards-button");
    this.characterCount = page.getByTestId("character-count");
    this.flashcardsList = page.getByTestId("flashcards-candidate-list");
    this.flashcardsSelectedCount = page.getByTestId("flashcards-selected-count");
    this.saveSelectedButton = page.getByTestId("save-selected-flashcards-button");
  }

  async goto() {
    await this.page.goto("/generate");
  }

  async fillSourceText(text: string) {
    await this.sourceTextInput.fill(text);
  }

  async setMaxFlashcards(count: number) {
    await this.maxFlashcardsInput.fill(count.toString());
  }

  async generateFlashcards() {
    await this.generateButton.click();
  }

  async selectFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-checkbox-${index}`).click();
  }

  async editFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-edit-button-${index}`).click();
  }

  async rejectFlashcard(index: number) {
    await this.page.getByTestId(`flashcard-reject-button-${index}`).click();
  }

  async saveSelectedFlashcards() {
    await this.saveSelectedButton.click();
  }

  getFlashcardFront(index: number): Locator {
    return this.page.getByTestId(`flashcard-front-${index}`);
  }

  getFlashcardBack(index: number): Locator {
    return this.page.getByTestId(`flashcard-back-${index}`);
  }
}
