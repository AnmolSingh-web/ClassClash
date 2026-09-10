const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  page.on('pageerror', (e) => console.log('PAGE_ERROR=' + e.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const appShellWidth = await page.$eval('.app-shell', (el) => getComputedStyle(el).width);
  const appShellHeight = await page.$eval('.app-shell', (el) => getComputedStyle(el).height);
  const appShellAspectRatio = await page.$eval('.app-shell', (el) => getComputedStyle(el).aspectRatio);
  console.log('appShellWidth=' + appShellWidth);
  console.log('appShellHeight=' + appShellHeight);
  console.log('appShellAspectRatio=' + appShellAspectRatio);
  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
