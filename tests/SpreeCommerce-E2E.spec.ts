import { test, expect } from '@playwright/test';

// E2E Test for Spree Commerce
test('Spree Commerce E2E Test', async ({ page }) => {
  test.setTimeout(120000);

  // Test Data
  const url = 'https://demo.spreecommerce.org/us/en/';
  const firstName = "Ian";
  const lastName = 'Mojado';
  const emailAddress = (domain: string = "yopmail.com"): string => {
    const randomUsername = Math.random().toString(10).substring(2, 10);
    return `iantest${randomUsername}@${domain}`;
    };
  const password = 'test123';
  const productName = (() => {
    if (process.env.product_name === undefined) return "Digital Air Fryer 4.2L";
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

  // Go to Spree Commerce website
  await page.goto(url);

  // Navigate to Sign up page and populate fields
  await page.getByRole('link', { name: 'Account', exact: true }).click();
  await page.waitForURL(url+'account')
  await expect(page.getByRole('main').getByText('My Account')).toBeVisible();
  await page.getByRole('link', { name: 'Sign up',  exact: true  }, ).click();
  await page.waitForURL(url+'account/register')
  await expect(page.getByRole('main').getByText('Create Account').first()).toBeVisible();
  await page.getByRole('textbox', { name: 'First name' }).fill(firstName);
  await page.getByRole('textbox', { name: 'Last name' }).fill(lastName);
  await page.getByRole('textbox', { name: 'Email Email' }).fill(emailAddress());
  const enteredEmail = await page.getByRole('textbox', { name: 'Email Email' }).inputValue();
  await page.getByRole('textbox', { name: 'Password Password' }).fill(password);
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill(password);
  await page.getByRole('checkbox', { name: 'I agree to the Privacy Policy' }).click();
  await page.getByRole('button', { name: 'Create Account' }).click();

  // Verify successful account creation using the email
  await page.waitForURL(url+'account')
  await expect(page.getByRole('heading', { name: 'Account Overview' })).toBeVisible();
  await expect(page.locator('//p[@class="text-sm text-gray-500 truncate"]')).toHaveText(enteredEmail);

  // Sign out > Re-login
  await page.getByRole('button', { name: 'Sign Out' }).click();
  await expect(page.getByRole('main').getByText('My Account')).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).fill(enteredEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Browse for the item and open
  await page.getByRole('button', { name: 'Open search' }).click();
  await page.getByRole('combobox', { name: 'Search...' }).fill(productName);
  await page.getByRole('combobox', { name: 'Search...' }).press('Enter');
  await page.waitForURL(url+'products?q=**')
  try {
    await expect(page.getByRole('link', { name: productName })).toBeVisible();
    await page.getByRole('link', { name: productName }).hover();
    await page.getByRole('link', { name: productName }).click();
  }
  catch {throw new Error("Product not found or unavailable. Please use a different product.");}
  // const productIsVisible = await page.getByRole('link', { name: productName }).isVisible();
  // if (productIsVisible === true) {
  //   await page.getByRole('link', { name: productName }).hover();
  //   await page.getByRole('link', { name: productName }).click();
  // }
  // else {throw new Error("Product not found or unavailable. Please use a different product.");}
  
  
  // Add the product to your cart
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByRole('link', { name: 'View Cart' })).toBeVisible();
  await page.getByRole('link', { name: 'View Cart' }).click();
  await expect(page.locator('//div//h3[@class="text-lg font-medium text-gray-900 truncate"]')).toHaveText(productName, { ignoreCase: true });
  console.log("Product Name: "+productName);
  const productQuantity = await page.locator('(//div[@class="flex items-center border border-gray-300 rounded-lg px-0.5"])[1]/span').textContent();
  console.log("Product Qty: "+productQuantity);
  const productPrice = await page.locator('(//div//p[@class="mt-2 text-lg font-semibold text-gray-900"])[1]').textContent();
  console.log("Product Price: "+productPrice);

  // Checkout Order
  await page.getByRole('link', { name: 'Proceed to Checkout' }).click();
  // Populate Shipping Address
  await page.waitForURL(url+'checkout/**');
  await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible();
  await page.getByLabel('Country').selectOption(shippingCountry);
  await page.getByRole('textbox', { name: 'Company (optional)' }).fill(shippingCompany);
  await page.getByRole('textbox', { name: 'Address', exact: true }).fill(shippingAddress);
  await page.getByRole('textbox', { name: 'Apartment, suite, etc. (' }).fill(shippingApartment);
  await page.getByRole('textbox', { name: 'City' }).fill(shippingCity);
  await page.getByLabel('State / Province').selectOption(shippingState);
  await page.getByRole('textbox', { name: 'ZIP / Postal code' }).fill(shippingZIP);
  await page.getByRole('textbox', { name: 'Phone (optional)' }).fill(shippingPhone);
  await page.getByRole('heading', { name: 'Shipping Address' }).click();
  // Select Shipping Method
  if (shippingMethod.toLowerCase() === 'standard') {
    await page.getByRole('radio', { name: 'Standard $' }).click(); }
  else if (shippingMethod.toLowerCase() === 'premium') {
     await page.getByRole('radio', { name: 'Premium $' }).click(); }
  else {throw new Error("Invalid Shipping Method input!"); }
  // Populate Payment Method
  const paymentMethodFrame = page.locator('iframe[title="Secure payment input frame"]').first().contentFrame();
  if (paymentMode.toLowerCase() === 'card') {
    await paymentMethodFrame.getByTestId('card').click(); 
    await paymentMethodFrame.getByRole('textbox', { name: 'Card number' }).fill(paymentCardNumber); 
    await paymentMethodFrame.getByRole('textbox', { name: 'Expiration date MM / YY' }).fill(paymentExpDate); 
    await paymentMethodFrame.getByRole('textbox', { name: 'Security code' }).fill(paymentSecurityCode); 
  }
  else if (paymentMode.toLowerCase() === 'affirm') {
    await paymentMethodFrame.getByTestId('affirm').click(); 
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only "); }
  else if (paymentMode.toLowerCase() === 'clearpay') {
    await paymentMethodFrame.getByTestId('afterpay_clearpay').click(); 
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only "); }
  else if (paymentMode.toLowerCase() === 'cashapp') {
    await paymentMethodFrame.getByTestId('cashapp').click(); 
    throw new Error("Selected Payment Method Out of Scope for now, use 'Card' only "); }
  else {throw new Error("Invalid Payment Mode input!"); }

  await page.getByRole('button', { name: 'Pay Now' }).click(); 
  
  // Verify confirmation
  await page.waitForURL(url+'order-placed/**', {waitUntil: 'domcontentloaded'});
  await expect(page.locator('//h1[contains(text(),\'Thanks for your order\')]')).toBeVisible();
  const orderNumber = await page.locator('//p[@class="text-gray-500" and contains(text(),\'Order #\')]').textContent();
  console.log("Order #: " + orderNumber?.substring(7))
  
});
