import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async clickProfileDetails(): Promise<void> {
    const profileBtn = this.page.getByRole('button', { name: 'Expand profile details and' });
    await expect(profileBtn).toBeVisible();
    await expect(profileBtn).toBeEnabled();
    await profileBtn.click();
  }

  async clickToAddBlogPost(): Promise<void> {
    const addBlogBtn = this.page.getByRole('link', { name: 'Add Blog Post' });
    await expect(addBlogBtn).toBeVisible({timeout: 30_000 });
    await Promise.all([
      this.page.waitForURL('**/blog/post/create/**', { timeout: 60_000 }),
      addBlogBtn.click(),
    ]);
  }
}
