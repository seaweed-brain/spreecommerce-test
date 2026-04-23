import { expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginSignUpPage extends BasePage {
  private readonly accountLink = () =>
    this.page.getByRole('link', { name: 'Account', exact: true });
  private readonly signUpLink = () =>
    this.page.getByRole('link', { name: 'Sign up', exact: true });
  private readonly emailField = () =>
    this.page.getByRole('textbox', { name: 'Email Email' });
  private readonly signOutButton = () =>
    this.page.getByRole('button', { name: 'Sign Out' });

  async openAccount(): Promise<void> {
    await this.accountLink().click();
    await this.page.waitForURL(`${this.baseUrl}account`);
  }

  async expectMyAccountVisible(): Promise<void> {
    await expect(this.page.getByRole('main').getByText('My Account')).toBeVisible();
  }

  async goToSignUp(): Promise<void> {
    const signUp = this.signUpLink();
    await expect(signUp).toBeVisible();
    await expect(signUp).toBeEnabled();
    await Promise.all([
      this.page.waitForURL(`${this.baseUrl}account/register`),
      signUp.click(),
    ]);
    await expect(this.page.getByRole('main').getByText('Create Account').first()).toBeVisible();
  }

  async fillCreateAccountForm(params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.page.getByRole('textbox', { name: 'First name' }).fill(params.firstName);
    await this.page.getByRole('textbox', { name: 'Last name' }).fill(params.lastName);
    await this.emailField().fill(params.email);
    await this.page.getByRole('textbox', { name: 'Password Password' }).fill(params.password);
    await this.page.getByRole('textbox', { name: 'Confirm Password' }).fill(params.password);
    await this.page.getByRole('checkbox', { name: 'I agree to the Privacy Policy' }).click();
  }

  async getEnteredEmail(): Promise<string> {
    return this.emailField().inputValue();
  }

  async submitCreateAccount(): Promise<void> {
    await this.page.getByRole('button', { name: 'Create Account' }).click();
  }

  async expectAccountOverview(email: string): Promise<void> {
    await this.page.waitForURL(`${this.baseUrl}account`);
    await expect(this.page.getByRole('heading', { name: 'Account Overview' })).toBeVisible();
    await expect(this.page.locator('//p[@class="text-sm text-gray-500 truncate"]')).toHaveText(email);
  }

  async signOut(): Promise<void> {
    await this.signOutButton().click();
    await this.expectMyAccountVisible();
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'Password' }).fill(password);
    await this.page.getByRole('button', { name: 'Sign In' }).click();
  }
}
