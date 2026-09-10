const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  page.on('pageerror', (e) => console.log('PAGE_ERROR=' + e.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.locator('#scheduleTab').evaluate((el) => { el.classList.add('active'); });
  const scrollHeight = await page.$eval('#scheduleTab', (el) => el.scrollHeight);
  const clientHeight = await page.$eval('#scheduleTab', (el) => el.clientHeight);
  const overflowY = await page.$eval('#scheduleTab', (el) => getComputedStyle(el).overflowY);
  const bodyOverflowY = await page.$eval('body', (el) => getComputedStyle(el).overflowY);
  console.log('scheduleTabScrollHeight=' + scrollHeight);
  console.log('scheduleTabClientHeight=' + clientHeight);
  console.log('scheduleTabOverflowY=' + overflowY);
  console.log('bodyOverflowY=' + bodyOverflowY);
  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
