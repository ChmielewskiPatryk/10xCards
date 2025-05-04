import type { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByRole('heading', { name: /Logowanie/i });
  }

  async goto() {
    await this.page.goto('/auth/login');
  }
} 