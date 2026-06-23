const { test, expect } = require('@playwright/test');

const { createTempMail, getOtp } = require('../utils/mail');

test('signup full flow', async ({ page }) => {
  const { email, token } = await createTempMail();

  await page.goto('https://authorized-partner.vercel.app/', {
    waitUntil: 'networkidle',
  });

  // landing page
  await page.getByRole('button', { name: 'Join Us Now' }).first().click();
  await page.locator('#remember').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // account details
  await page.fill('input[placeholder="Enter Your First Name"]', 'Samyam');
  await page.fill('input[placeholder="Enter Your Last Name"]', 'Test');
  await page.fill('input[placeholder="Enter Your Email Address"]', email);
  await page.locator('input[name="phoneNumber"]').fill(`98${Date.now().toString().slice(-8)}`);
  await page.locator('input[name="password"]').fill('Test@1234');
  await page.locator('input[type="password"]').nth(1).fill('Test@1234');
  await page.getByRole('button', { name: 'Next' }).click();

  // otp — wait for input to appear first, THEN fetch otp
  await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
  const otp = await getOtp(token);
  console.log('otp received:', otp);
  await page.locator('input').first().fill(otp);
  const verifyBtn = page.locator('button:has-text("Verify")');
  await expect(verifyBtn).toBeEnabled({ timeout: 20000 });
  await verifyBtn.click();

  // agency details
  await page.waitForSelector('text=About your Agency', { timeout: 20000 });
  await page.locator('input[name="agency_name"]').fill('Test Agency');
  await page.locator('input[name="role_in_agency"]').fill('Owner');
  await page.locator('input[name="agency_email"]').fill(email);
  await page.locator('input[name="agency_website"]').fill('www.example.com');
  await page.locator('input[name="agency_address"]').fill('Kathmandu');

  // region combobox (agency step)
  await page.locator('button[role="combobox"]').click();
  await page.getByText('Nepal', { exact: true }).click();
  const nextBtn1 = page.getByRole('button', { name: 'Next' });
  await expect(nextBtn1).toBeEnabled();
  await nextBtn1.click();

  // experience step
  await page.waitForSelector('text=Experience and Performance Metrics', { timeout: 20000 });
  await page.locator('input[name="number_of_students_recruited_annually"]').fill('100');
  await page.locator('input[name="focus_area"]').fill('Undergraduate admissions');
  await page.locator('input[name="success_metrics"]').fill('90');

  // years of experience combobox
  const expCombobox = page.locator('button[role="combobox"]').first();
  await expCombobox.click();
  await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
  await page.locator('[role="listbox"] [role="option"]').filter({ hasText: /^5 years$/ }).click();

  // services provided — button[role="checkbox"] triggered via its label
  for (const service of ['Career Counseling', 'Admission Applications', 'Visa Processing', 'Test Prepration']) {
    await page.locator('label').filter({ hasText: service }).click();
  }

  const nextBtn2 = page.getByRole('button', { name: 'Next' });
  await expect(nextBtn2).toBeEnabled();
  await nextBtn2.click();

  // business details step
  await page.waitForSelector('input[name="business_registration_number"]', { timeout: 20000 });
  await page.fill('input[name="business_registration_number"]', 'BRN123456');

  // preferred countries — Radix combobox opens a dialog
  await page.locator('button[role="combobox"][aria-haspopup="dialog"]').click();
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  await page.getByText('Australia', { exact: true }).click();
  await page.getByText('United Kingdom', { exact: true }).click();
  await page.keyboard.press('Escape');

  // institution types — button[role="checkbox"] triggered via its label
  for (const inst of ['Universities', 'Colleges']) {
    await page.locator('label').filter({ hasText: inst }).click();
  }

  // certification details (optional)
  await page.fill('input[name="certification_details"]', 'ICEF Certified');

  // file uploads — inputs are hidden inside dropzone divs, target by index
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(0).setInputFiles('tests/sample.pdf');
  await fileInputs.nth(1).setInputFiles('tests/sample.pdf');

  // submit
  const submitBtn = page.locator('button[type="submit"]');
  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  // final assertion
await Promise.all([
  page.waitForURL(/verification|preferences|complete|dashboard/i, { timeout: 60000 }),
  submitBtn.click(),
]);
  console.log('signup flow done');
await page.waitForTimeout(20000);
});