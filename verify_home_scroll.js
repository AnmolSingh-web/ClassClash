const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  page.on('pageerror', (e) => console.log('PAGE_ERROR=' + e.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.$('#homeTab');
  await page.locator('[data-tab="home"]').first().evaluate((el) => el.click());
  const contentHeight = await page.$eval('#homeTab', (el) => el.scrollHeight);
  const contentClientHeight = await page.$eval('#homeTab', (el) => el.clientHeight);
  const appOverflowY = await page.$eval('body', (el) => getComputedStyle(el).overflowY);
  const mainOverflowY = await page.$eval('.main-content', (el) => getComputedStyle(el).overflowY);
  console.log('homeScrollHeight=' + contentHeight);
  console.log('homeClientHeight=' + contentClientHeight);
  console.log('bodyOverflowY=' + appOverflowY);
  console.log('mainOverflowY=' + mainOverflowY);
  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
