import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AddBlogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async uploadBlogImage(relativePathFromProjectRoot: string): Promise<void> {
    const uploadBtn = this.page.locator('//input[@title="Image uploader for blog"]');
    await expect(uploadBtn).toBeAttached();
    const filePath = this.projectPath(relativePathFromProjectRoot);
    await uploadBtn.setInputFiles(filePath);
  }

  async inputBlogTitle(title: string): Promise<void> {
    const blogTitleText = this.page.getByRole('textbox', { name: 'Post title' });
    await expect(blogTitleText).toBeVisible();
    await expect(blogTitleText).toBeEnabled();
    const nestedEditable = blogTitleText.locator('[contenteditable="true"]').first();
    const target = (await nestedEditable.count()) > 0 ? nestedEditable : blogTitleText;
    await target.click();
    const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
    await this.page.keyboard.press(selectAll);
    await this.page.keyboard.press('Backspace');
    await target.pressSequentially(title, { delay: 15 });
    await expect(blogTitleText).toContainText(title);
    await target.press('Tab');
  }

  async inputBlogSummary(summary: string): Promise<void> {
    const blogSummaryText = this.page.getByRole('textbox', { name: 'Post summary' });
    await expect(blogSummaryText).toBeVisible();
    const nestedEditable = blogSummaryText.locator('[contenteditable="true"]').first();
    const target = (await nestedEditable.count()) > 0 ? nestedEditable : blogSummaryText;
    await target.click();
    const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
    await this.page.keyboard.press(selectAll);
    await this.page.keyboard.press('Backspace');
    await target.pressSequentially(summary, { delay: 15 });
    await expect(blogSummaryText).toContainText(summary);
    await target.press('Tab');
  }

  async inputBlogContent(content: string): Promise<void> {
    const blogContentText = this.page.locator('#blogPostBodyContent');
    await expect(blogContentText).toBeVisible();
    const nestedEditable = blogContentText.locator('[contenteditable="true"]').first();
    const target = (await nestedEditable.count()) > 0 ? nestedEditable : blogContentText;
    await target.click();
    const selectAll = process.platform === 'darwin' ? 'Meta+A' : 'Control+A';
    await this.page.keyboard.press(selectAll);
    await this.page.keyboard.press('Backspace');
    await target.pressSequentially(content, { delay: 15 });
    await expect(blogContentText).toContainText(content);
  }

  async clickContinue(): Promise<void> {
    await this.page.getByRole('link', { name: 'Continue' }).click();
  }

  async setPublished(enabled: boolean): Promise<void> {
    if (!enabled) return;
    await this.page
      .locator(
        '//label[@class="switch" and @data-original-title="Published blog posts are visible for everyone"]',
      )
      .click();
  }

  async setFeatured(enabled: boolean): Promise<void> {
    if (!enabled) return;
    await this.page
      .locator(
        '//label[@class="switch" and @data-original-title="Published featured posts appear at the top of the all blogs page"]',
      )
      .click();
  }

  async clickSave(): Promise<void> {
    const saveBtn = this.page.getByRole('link', { name: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
  }

  async saveAndWaitForPostPage(): Promise<void> {
    const saveBtn = this.page.getByRole('link', { name: 'Save' });
    await expect(saveBtn).toBeVisible();
    await Promise.all([
      this.page.waitForURL('**/blog/**/post/**', { timeout: 60_000 }),
      saveBtn.click(),
    ]);
  }

  async addBlogPost(options: {
    imagePath: string;
    title: string;
    summary: string;
    content: string;
    toPublish?: boolean;
    toFeature?: boolean;
  }): Promise<void> {
    const { imagePath: imagePath, title, summary, content, toPublish: publish = true, toFeature: featured = true } = options;
    await this.uploadBlogImage(imagePath);
    await this.inputBlogTitle(title);
    await this.inputBlogSummary(summary);
    await this.inputBlogContent(content);
    await this.clickContinue();
    await this.setPublished(publish);
    await this.setFeatured(featured);
  }
}
