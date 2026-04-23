import { test } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginSignUpPage } from '../pages/LoginSignUpPage';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';

// E2E Test for Spree Commerce
test('Place Order and Checkout', async ({ page }) => {
  test.setTimeout(60000);

  const baseUrl = 'https://demo.spreecommerce.org/us/en/';
  const basePage = new BasePage(page, baseUrl);
  const loginSignUpPage = new LoginSignUpPage(page, baseUrl);
  const homePage = new HomePage(page, baseUrl);
  const productPage = new ProductPage(page, baseUrl);
  const checkoutPage = new CheckoutPage(page, baseUrl);
  const confirmationPage = new ConfirmationPage(page, baseUrl);

  // Test Data
  const firstName = 'Ian';
  const lastName = 'Mojado';
  const emailAddress = (domain: string = 'yopmail.com'): string => {
    const randomUsername = Math.random().toString(10).substring(2, 10);
    return `iantest${randomUsername}@${domain}`;
  };
  const password = 'test123';
  const productName = (() => {
    if (process.env.product_name === undefined) return 'Digital Air Fryer 4.2L';
    return process.env.product_name;
  })();
  const shippingCountry = 'United States';
  const shippingCompany = 'Globe Telecom';
  const shippingAddress = '123 Test St.';
  const shippingApartment = 'Apartment 456';
  const shippingCity = 'Sterling';
  const shippingState = 'Virginia';
  const shippingZIP = '20166';
  const shippingPhone = '8908908900';
  const shippingMethod = 'Standard';
  const paymentMode = 'Card';
  const paymentCardNumber = '4242 4242 4242 4242';
  const paymentExpDate = '04/30';
  const paymentSecurityCode = '333';
  const paymentCountry = 'United States';
  const paymentZipCode = '20166';

  // Test Steps
  await basePage.goto();

  await loginSignUpPage.openAccount();
  await loginSignUpPage.expectMyAccountVisible();
  await loginSignUpPage.goToSignUp();
  await loginSignUpPage.fillCreateAccountForm({
    firstName,
    lastName,
    email: emailAddress(),
    password,
  });
  const enteredEmail = await loginSignUpPage.getEnteredEmail();
  await loginSignUpPage.submitCreateAccount();
  await loginSignUpPage.expectAccountOverview(enteredEmail);

  await loginSignUpPage.signOut();
  await loginSignUpPage.signIn(enteredEmail, password);

  await homePage.searchProduct(productName);
  await productPage.openProductByName(productName);

  await productPage.addToCart();
  await productPage.viewCart();
  await productPage.expectProductInCart(productName);
  console.log('Product Name: ' + productName);
  const productQuantity = await productPage.getCartQuantityText();
  console.log('Product Qty: ' + productQuantity);
  const productPrice = await productPage.getCartPriceText();
  console.log('Product Price: ' + productPrice);

  await productPage.proceedToCheckout();
  await checkoutPage.expectShippingAddressHeading();
  await checkoutPage.fillShippingAddress({
    country: shippingCountry,
    company: shippingCompany,
    address: shippingAddress,
    apartment: shippingApartment,
    city: shippingCity,
    state: shippingState,
    zip: shippingZIP,
    phone: shippingPhone,
  });
  await checkoutPage.selectShippingMethod(shippingMethod);
  await checkoutPage.fillPaymentByMode(paymentMode, {
    cardNumber: paymentCardNumber,
    expDate: paymentExpDate,
    securityCode: paymentSecurityCode,
    country: paymentCountry,
    zipCode: paymentZipCode,
  });
  await checkoutPage.payNowAndWaitForOrderPlaced();

  await confirmationPage.expectThanksForOrderVisible();
  const orderNumber = await confirmationPage.getOrderNumberRawText();
  console.log('Order #: ' + orderNumber?.replace('Order #', '').trim());
});
