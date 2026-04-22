import type { Page } from '@playwright/test';
import path from 'path';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(urlPath: string): Promise<void> {
    await this.page.goto(urlPath, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(url: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(url, { timeout: options?.timeout ?? 60_000 });
  }

  protected projectPath(...segments: string[]): string {
    return path.join(__dirname, '..', ...segments);
  }
}
