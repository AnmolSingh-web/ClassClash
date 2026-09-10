const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  page.on('pageerror', (e) => console.log('PAGE_ERROR=' + e.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });

  const mobileNavDisplay = await page.$eval('.mobile-nav', (el) => getComputedStyle(el).display);
  const mobileNavZ = await page.$eval('.mobile-nav', (el) => getComputedStyle(el).zIndex);
  const mobileNavBottom = await page.$eval('.mobile-nav', (el) => getComputedStyle(el).bottom);
  const mobileNavHeight = await page.$eval('.mobile-nav', (el) => getComputedStyle(el).height);
  const mainPadBottom = await page.$eval('.main-content', (el) => getComputedStyle(el).paddingBottom);
  const mainOverflowY = await page.$eval('.main-content', (el) => getComputedStyle(el).overflowY);
  const bodyOverflowY = await page.$eval('body', (el) => getComputedStyle(el).overflowY);

  console.log('mobileNavDisplay=' + mobileNavDisplay);
  console.log('mobileNavZ=' + mobileNavZ);
  console.log('mobileNavBottom=' + mobileNavBottom);
  console.log('mobileNavHeight=' + mobileNavHeight);
  console.log('mainPadBottom=' + mainPadBottom);
  console.log('mainOverflowY=' + mainOverflowY);
  console.log('bodyOverflowY=' + bodyOverflowY);

  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
