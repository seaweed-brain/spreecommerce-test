import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ConfirmationPage extends BasePage {
  private readonly thanksHeading = () =>
    this.page.locator("//h1[contains(text(),'Thanks for your order')]");
  private readonly orderNumberLine = () =>
    this.page.locator('//p[@class="text-gray-500" and contains(text(),\'Order #\')]');

  async expectThanksForOrderVisible(): Promise<void> {
    await expect(this.thanksHeading()).toBeVisible();
  }

  async getOrderNumberRawText(): Promise<string | null> {
    return this.orderNumberLine().textContent();
  }
}
