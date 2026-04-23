import type { Page } from '@playwright/test';
export class BasePage {
  constructor(
    readonly page: Page,
    readonly baseUrl: string
  ) {}

  async goto(url?: string): Promise<void> {
    await this.page.goto(url ?? this.baseUrl);
  }
}
