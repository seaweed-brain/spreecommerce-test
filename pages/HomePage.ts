import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly openSearchButton = () =>
    this.page.getByRole('button', { name: 'Open search' });
  private readonly searchCombobox = () =>
    this.page.getByRole('combobox', { name: 'Search...' });

  async searchProduct(productName: string): Promise<void> {
    await this.openSearchButton().click();
    await this.searchCombobox().fill(productName);
    await this.searchCombobox().press('Enter');
    await this.page.waitForURL(`${this.baseUrl}products?q=**`);
  }
}
