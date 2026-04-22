import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectLoaded(): Promise<void> {
    const user = this.page.getByRole('textbox', { name: 'Username*' });
    const pass = this.page.getByRole('textbox', { name: 'Password*' });
    await expect(user).toBeVisible();
    await expect(pass).toBeVisible();
    await expect(user).toBeEditable();
    await expect(pass).toBeEditable();
  }

  async login(username: string, password: string): Promise<void> {
    await this.expectLoaded();
    await this.page.getByRole('textbox', { name: 'Username*' }).fill(username);
    await this.page.getByRole('textbox', { name: 'Password*' }).fill(password);
    await Promise.all([
      this.page.waitForURL('**/#home', { timeout: 60_000 }),
      this.page.getByRole('button', { name: 'Log in' }).click(),
    ]);
  }
}
