const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const baseUrl = 'http://localhost:3001';
  const username = 'admin';
  const password = '123456';

  console.log(`Navigating to ${baseUrl}/login...`);
  await page.goto(`${baseUrl}/login`);

  console.log('Filling in credentials...');
  await page.fill('#email', username);
  await page.fill('#password', password);

  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Login successful! Redirected to dashboard.');
  } catch (error) {
    console.error('Login failed or timed out:', error.message);
  }

  await page.waitForTimeout(5000);
  await browser.close();
  console.log('Browser closed.');
})();
