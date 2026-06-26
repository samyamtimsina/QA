const { test, expect } = require('@playwright/test');
const { createTempMail, getOtp } = require('../utils/mail');

test('signup full flow', async ({ page }) => {
  const { email, token } = await createTempMail();

  await page.goto('https://authorized-partner.vercel.app/', {
    waitUntil: 'networkidle',
  });

  // -----------------------------
  // LANDING
  // -----------------------------
  await page.getByRole('button', { name: 'Join Us Now' }).first().click();
  await page.locator('#remember').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // -----------------------------
  // ACCOUNT DETAILS
  // -----------------------------
  await page.fill('input[placeholder="Enter Your First Name"]', 'Samyam');
  await page.fill('input[placeholder="Enter Your Last Name"]', 'Test');
  await page.fill('input[placeholder="Enter Your Email Address"]', email);

  await page.locator('input[name="phoneNumber"]')
    .fill(`98${Date.now().toString().slice(-8)}`);

  await page.locator('input[name="password"]').fill('Test@1234');
  await page.locator('input[type="password"]').nth(1).fill('Test@1234');

  await page.getByRole('button', { name: 'Next' }).click();

  // OTP

  await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });

  const otp = await getOtp(token);
  console.log('otp received:', otp);

  await page.locator('input').first().fill(otp);

  const verifyBtn = page.getByRole('button', { name: /verify/i });
  await expect(verifyBtn).toBeEnabled({ timeout: 20000 });
  await verifyBtn.click();

  // AGENCY DETAILS

  await expect(page.getByText('About your Agency')).toBeVisible({ timeout: 20000 });

  await page.locator('input[name="agency_name"]').fill('Test Agency');
  await page.locator('input[name="role_in_agency"]').fill('Owner');
  await page.locator('input[name="agency_email"]').fill(email);
  await page.locator('input[name="agency_website"]').fill('www.example.com');
  await page.locator('input[name="agency_address"]').fill('Kathmandu');

  await page.locator('button[role="combobox"]').first().click();
  await page.getByText('Nepal', { exact: true }).click();

  const nextBtn1 = page.getByRole('button', { name: 'Next' });
  await expect(nextBtn1).toBeEnabled();
  await nextBtn1.click();


  // EXPERIENCE

  await expect(page.getByText('Experience and Performance Metrics')).toBeVisible({
    timeout: 20000,
  });

  await page.locator('input[name="number_of_students_recruited_annually"]').fill('100');
  await page.locator('input[name="focus_area"]').fill('Undergraduate admissions');
  await page.locator('input[name="success_metrics"]').fill('90');


  // YEARS OF EXPERIENCE (FIXED RADIX ISSUE)

  const yearsDropdown = page
    .locator('text=Years of Experience')
    .locator('..')
    .locator('button[role="combobox"]');

  await yearsDropdown.click();

  await page.getByRole('option', { name: '5 years' }).click();

  // confirm ONLY visible UI (no strict mode conflict)
  await expect(yearsDropdown).toContainText('5 years');


  // SERVICES

  for (const service of [
    'Career Counseling',
    'Admission Applications',
    'Visa Processing',
    'Test Prepration',
  ]) {
    await page.locator('label').filter({ hasText: service }).click();
  }

  await page.getByRole('button', { name: 'Next' }).click();

  
  // BUSINESS DETAILS
 
  await expect(
    page.getByText('Verification and Preferences')
  ).toBeVisible({ timeout: 30000 });

  await expect(
    page.locator('input[name="business_registration_number"]')
  ).toBeVisible({ timeout: 30000 });

  await page.locator('input[name="business_registration_number"]')
    .fill('BRN123456');

  // countries dropdown
  await page.locator('button[role="combobox"]').first().click();

  await page.getByText('Australia', { exact: true }).click();
  await page.getByText('United Kingdom', { exact: true }).click();

  await page.keyboard.press('Escape');

  // institution types
  for (const inst of ['Universities', 'Colleges']) {
    await page.locator('label').filter({ hasText: inst }).click();
  }

  // certification
  await page.locator('input[name="certification_details"]')
    .fill('ICEF Certified');

  // file uploads
  const fileInputs = page.locator('input[type="file"]');
  await fileInputs.nth(0).setInputFiles('tests/sample.pdf');
  await fileInputs.nth(1).setInputFiles('tests/sample.pdf');

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const submitBtn = page.getByRole('button', { name: /submit/i });

  await expect(submitBtn).toBeEnabled();
  await submitBtn.click();

  await expect(page).toHaveURL(
    /verification|preferences|complete|dashboard/i,
    { timeout: 60000 }
  );

  console.log('signup flow done');
});
