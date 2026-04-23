import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  private readonly cartProductTitle = () =>
    this.page.locator('//div//h3[@class="text-lg font-medium text-gray-900 truncate"]');
  private readonly cartQuantity = () =>
    this.page.locator('(//div[@class="flex items-center border border-gray-300 rounded-lg px-0.5"])[1]/span');
  private readonly cartPrice = () =>
    this.page.locator('(//div//p[@class="mt-2 text-lg font-semibold text-gray-900"])[1]');

  async openProductByName(productName: string): Promise<void> {
    try {
      const link = this.page.getByRole('link', { name: productName });
      await expect(link).toBeVisible();
      await link.hover();
      await link.click();
    } catch {
      throw new Error('Product not found or unavailable. Please use a different product.');
    }
  }

  async addToCart(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add to Cart' }).click();
  }

  async viewCart(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'View Cart' })).toBeVisible();
    await this.page.getByRole('link', { name: 'View Cart' }).click();
  }

  async expectProductInCart(productName: string): Promise<void> {
    await expect(this.cartProductTitle()).toHaveText(productName, { ignoreCase: true });
  }

  async getCartQuantityText(): Promise<string | null> {
    return this.cartQuantity().textContent();
  }

  async getCartPriceText(): Promise<string | null> {
    return this.cartPrice().textContent();
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('link', { name: 'Proceed to Checkout' }).click();
    await this.page.waitForURL(`${this.baseUrl}checkout/**`);
  }
}
