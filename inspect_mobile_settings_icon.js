const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });

  await page.locator('[data-tab="settings"]').first().evaluate((el) => el.click());
  await page.$eval('#mobileSettingsUpload', (el) => {
    getComputedStyle(el).display;
  });

  const iconDisplay = await page.$eval('#mobileSettingsUpload', (el) => getComputedStyle(el).display);
  const iconPositionFixed = await page.$eval('#mobileSettingsUpload', (el) => getComputedStyle(el).position);
  const iconTop = await page.$eval('#mobileSettingsUpload', (el) => getComputedStyle(el).top);
  const iconZ = await page.$eval('#mobileSettingsUpload', (el) => getComputedStyle(el).zIndex);

  console.log('iconDisplay=' + iconDisplay);
  console.log('iconPositionFixed=' + iconPositionFixed);
  console.log('iconTop=' + iconTop);
  console.log('iconZ=' + iconZ);

  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
