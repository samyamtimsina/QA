const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://authorized-partner.vercel.app/');

 await page.locator('button.primary-btn').first().click();
 // Wait for agreement page
  await page.waitForSelector('text=Register Your Agency');

  // Tick checkbox
await page.locator('#remember').click();

  // Click Continue
  await page.getByRole('button', { name: 'Continue' }).click();

  // Verify we moved to next page
  await page.waitForSelector('text=Complete Your Agent Profile');
});