const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGE_ERROR=' + e.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.$('#scheduleList');
  const sheetDayBlocks = await page.$$eval('#scheduleList .sheet-day-block', (items) => items.length);
  const scheduleListHtml = (await page.$eval('#scheduleList', (el) => el.innerHTML)).trim();

  console.log('sheetDayBlocks=' + sheetDayBlocks);
  console.log('scheduleListHtml=' + scheduleListHtml);

  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
