const { test, expect } = require('@playwright/test');

const { createTempMail, getOtp } = require('../utils/mail');

test('signup full flow', async ({ page }) => {
  const { email, token } = await createTempMail();

  await page.goto('https://authorized-partner.vercel.app/', {
    waitUntil: 'networkidle',
  });

  // landing page stuff
  await page.getByRole('button', { name: 'Join Us Now' }).first().click();

  await page.locator('#remember').click();

  await page.getByRole('button', { name: 'Continue' }).click();

  // account details step
  await page.fill('input[placeholder="Enter Your First Name"]', 'Samyam');

  await page.fill('input[placeholder="Enter Your Last Name"]', 'Test');

  await page.fill('input[placeholder="Enter Your Email Address"]', email);

  await page.locator('input[name="phoneNumber"]').fill(`98${Date.now().toString().slice(-8)}`);

  await page.locator('input[name="password"]').fill('Test@1234');

  await page.locator('input[type="password"]').nth(1).fill('Test@1234');

  await page.getByRole('button', { name: 'Next' }).click();

  // otp verification step
  const otp = await getOtp(token);

  console.log('otp received:', otp);

  const otpInput = page.locator('input').first();

  await expect(otpInput).toBeVisible();

  await otpInput.fill(otp);

  const verifyBtn = page.locator('button:has-text("Verify")');

  await expect(verifyBtn).toBeEnabled({ timeout: 20000 });

  await verifyBtn.click();

  // waiting for transition after verification

  await page.waitForSelector('text=About your Agency', { timeout: 20000 });

  // agency details step
  await page.locator('input[name="agency_name"]').fill('Test Agency');

  await page.locator('input[name="role_in_agency"]').fill('Owner');

  await page.locator('input[name="agency_email"]').fill(email);

  await page.locator('input[name="agency_website"]').fill('www.example.com');

  await page.locator('input[name="agency_address"]').fill('Kathmandu');

  // region selection (important one)
  await page.locator('button[role="combobox"]').click();

  await page.getByText('Nepal', { exact: true }).click();

  const nextBtn1 = page.getByRole('button', { name: 'Next' });

  await expect(nextBtn1).toBeEnabled();

  await nextBtn1.click();

  // wait for experience section to load

  await page.waitForSelector('text=Experience and Performance Metrics');

  // experience + performance inputs

  await page.locator('input[name="number_of_students_recruited_annually"]').fill('100');

  await page.locator('input[name="focus_area"]').fill('Undergraduate admissions');

  await page.locator('input[name="success_metrics"]').fill('90');

  await page.locator('label:has-text("Career Counseling")').click();

  await page.locator('label:has-text("Admission Applications")').click();

  await page.locator('label:has-text("Visa Processing")').click();

  await page.locator('label:has-text("Test Prepration")').click();

  const nextBtn2 = page.getByRole('button', { name: 'Next' });

  await expect(nextBtn2).toBeEnabled();

  await nextBtn2.click();

  // waiting for business details step to load

  await page.waitForSelector('input[name*="business"]', { timeout: 20000 });

  // business details section

  await page.fill('input[name*="business"]', 'BRN123456');

  await page.locator('text=Australia').click();

  await page.locator('text=Universities').click();

  await page.locator('text=Colleges').click();

  // file upload section

  await page.setInputFiles('input[type="file"]', 'tests/sample.pdf');

  const uploads = page.locator('input[type="file"]');

  if ((await uploads.count()) > 1) {
    await uploads.nth(1).setInputFiles('tests/sample.pdf');
  }

  const nextBtn3 = page.getByRole('button', { name: 'Next' });

  await expect(nextBtn3).toBeEnabled();

  await nextBtn3.click();

  // final step check

  await expect(page).toHaveURL(/verification|preferences|complete/i);

  console.log('signup flow done ');
});
