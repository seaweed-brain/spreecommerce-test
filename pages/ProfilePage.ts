import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async openAllPosts(): Promise<void> {
    const allPostsBtn = this.page.getByRole('button', { name: 'All Posts' });
    await expect(allPostsBtn).toBeVisible({ timeout: 120_000 });
    await Promise.all([ 
      this.page.waitForURL('**/profile/**', { timeout: 60_000 }),
      allPostsBtn.click(),
    ]);
  }

  async openBlogByTitle(postTitle: string): Promise<void> {
    const blogLink = this.page
      .locator('h2')
      .filter({ hasText: postTitle })
      .locator('xpath=ancestor::div[1]');
    await expect(blogLink).toBeVisible({ timeout: 30_000 });
    await blogLink.scrollIntoViewIfNeeded();
    await blogLink.click();
  }

  async verifyBlogPostedDetails(postTitle: string, postSummary: string, postContent: string): Promise<void> {
    const blogTitleDisplay = this.page.locator('//div/h1');
    const blogSummaryDisplay = this.page.locator('//div/p/strong');
    const blogContentDisplay = this.page.locator('//section/p');
    await expect(blogTitleDisplay).toBeVisible({ timeout: 30_000 });
    await expect(blogTitleDisplay).toHaveText(postTitle, { timeout: 15_000 });
    await expect(blogSummaryDisplay).toHaveText(postSummary, { timeout: 15_000 });
    await expect(blogContentDisplay).toHaveText(postContent, { timeout: 15_000 });
    const uploadedImage = this.page.locator('//article//img[@alt=""]');
    await expect(uploadedImage).toBeVisible({ timeout: 15_000 });
    await expect
      .poll(async () => uploadedImage.evaluate((img: HTMLImageElement) => img.naturalWidth > 0))
      .toBeTruthy();
  }
}
