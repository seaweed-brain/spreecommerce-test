import { expect, type FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';

export type ShippingAddressFields = {
  country: string;
  company: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export type CardPaymentFields = {
  cardNumber: string;
  expDate: string;
  securityCode: string;
  country: string;
  zipCode: string;
};

export class CheckoutPage extends BasePage {
  private paymentFrame(): FrameLocator {
    return this.page.locator('iframe[title="Secure payment input frame"]').first().contentFrame();
  }

  async expectShippingAddressHeading(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible({timeout: 60_000});
  }

  async fillShippingAddress(fields: ShippingAddressFields): Promise<void> {
    await this.page.getByLabel('Country').selectOption(fields.country);
    await this.page.getByRole('textbox', { name: 'Company (optional)' }).fill(fields.company);
    await this.page.getByRole('textbox', { name: 'Address', exact: true }).fill(fields.address);
    await this.page.getByRole('textbox', { name: 'Apartment, suite, etc. (' }).fill(fields.apartment);
    await this.page.getByRole('textbox', { name: 'City' }).fill(fields.city);
    await this.page.getByLabel('State / Province').selectOption(fields.state);
    await this.page.getByRole('textbox', { name: 'ZIP / Postal code' }).fill(fields.zip);
    await this.page.getByRole('textbox', { name: 'Phone (optional)' }).fill(fields.phone);
    await this.page.getByRole('heading', { name: 'Shipping Address' }).click();
  }

  async selectShippingMethod(method: string): Promise<void> {
    const key = method.toLowerCase();
    const shippingOption =
      key === 'standard'
        ? this.page.getByRole('radio', { name: /Standard \$/i })
        : key === 'premium'
          ? this.page.getByRole('radio', { name: /Premium \$/i })
          : null;
    if (!shippingOption) {
      throw new Error('Invalid Shipping Method input!');
    }
    await shippingOption.scrollIntoViewIfNeeded();
    await expect(shippingOption).toBeVisible();
    await shippingOption.check();
    await expect(shippingOption).toBeChecked();
  }

  async fillPaymentCard(fields: CardPaymentFields): Promise<void> {
    const frame = this.paymentFrame();
    await frame.getByTestId('card').click();
    await frame.getByRole('textbox', { name: 'Card number' }).fill(fields.cardNumber);
    await frame.getByRole('textbox', { name: 'Expiration date MM / YY' }).fill(fields.expDate);
    await frame.getByRole('textbox', { name: 'Security code' }).fill(fields.securityCode);
    await frame.getByLabel('Country', { exact: true }).selectOption(fields.country);
    await frame.getByLabel('Zip Code').fill(fields.zipCode);
    await expect(frame.getByLabel('Zip Code')).toHaveValue(fields.zipCode);
    await frame.getByLabel('Zip Code').press('Tab');
  }

  async selectAffirmPayment(): Promise<void> {
    await this.paymentFrame().getByTestId('affirm').click();
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only ");
  }

  async selectClearpayPayment(): Promise<void> {
    await this.paymentFrame().getByTestId('afterpay_clearpay').click();
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only ");
  }

  async selectCashAppPayment(): Promise<void> {
    await this.paymentFrame().getByTestId('cashapp').click();
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only ");
  }

  async fillPaymentByMode(
    paymentMode: string,
    cardFields: CardPaymentFields
  ): Promise<void> {
    const mode = paymentMode.toLowerCase();
    if (mode === 'card') {
      await this.fillPaymentCard(cardFields);
      return;
    }
    if (mode === 'affirm') {
      await this.selectAffirmPayment();
    } else if (mode === 'clearpay') {
      await this.selectClearpayPayment();
    } else if (mode === 'cashapp') {
      await this.selectCashAppPayment();
    } else {
      throw new Error('Invalid Payment Mode input!');
    }
  }

  async payNowAndWaitForOrderPlaced(): Promise<void> {
    const payNowButton = this.page.getByRole('button', { name: 'Pay Now' });
    await expect(payNowButton).toBeVisible();
    await expect(payNowButton).toBeEnabled();
    await Promise.all([
      this.page.waitForURL(`${this.baseUrl}order-placed/**`, { waitUntil: 'domcontentloaded' }),
      payNowButton.click(),
    ]);
  }
}
