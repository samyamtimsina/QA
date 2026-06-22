const { test, expect } = require('@playwright/test');

test('signup full flow', async ({ page }) => {

  await page.goto('https://authorized-partner.vercel.app/');

  // =========================
  // STEP 0: LANDING PAGE
  // =========================
  await page.getByRole('button', { name: 'Join Us Now' }).first().click();


  // STEP 1: AGREEMENT PAGE
  // =========================
  await page.waitForSelector('text=Register Your Agency');

  // custom checkbox (IMPORTANT FIX)
  await page.locator('#remember').click();

  await page.getByRole('button', { name: 'Continue' }).click();

  // STEP 2: ACCOUNT SETUP FORM
 
  await page.waitForSelector('text=Complete Your Agent Profile');

  const email = `test${Date.now()}@gmail.com`;

  // First name
  await page.fill('input[placeholder="Enter Your First Name"]', 'Samyam');

  // Last name
  await page.fill('input[placeholder="Enter Your Last Name"]', 'Test');

  // Email
  await page.fill('input[placeholder="Enter Your Email Address"]', email);

  // Phone 
  await page.locator('input[name="phoneNumber"]').fill('9812345678');

  // Password 
  await page.locator('input[name="password"]').fill('Test@1234');

  // Confirm password (fallback safest way)
  await page.locator('input[type="password"]').nth(1).fill('Test@1234');
 
  await page.waitForTimeout(2000);
 
  await page.getByRole('button', { name: 'Next' }).click();

await page.pause();

// After you enter OTP and continue...

// Agency Name
await page.locator('input[name="agencyName"]').fill('Test Agency');

// Role in Agency
await page.locator('input[name="role"]').fill('Owner');

// Agency Email
await page.locator('input[name="agencyEmail"]').fill('agency@test.com');

// Website
await page.locator('input[name="website"]').fill('https://testagency.com');

// Address
await page.locator('input[name="address"]').fill('Kathmandu, Nepal');

// Region dropdown
await page.locator('YOUR_REGION_SELECTOR').click();
await page.getByText('Asia').click();

// Next
await page.getByRole('button', { name: 'Next' }).click();
 
  
  await page.waitForTimeout(2000);

});