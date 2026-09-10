const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const state = await page.evaluate(() => ({
    message: document.querySelector('#statusMessage').textContent.trim(),
    currentClass: document.querySelector('#currentClassName').textContent.trim(),
    indicatorHidden: document.querySelector('#currentClassIndicator').hidden,
    metaHidden: document.querySelector('#currentClassMeta').hidden,
    progressHidden: document.querySelector('#currentProgressWrap').hidden
  }));
  console.log('message=' + state.message);
  console.log('currentClass=' + state.currentClass);
  console.log('indicatorHidden=' + state.indicatorHidden);
  console.log('metaHidden=' + state.metaHidden);
  console.log('progressHidden=' + state.progressHidden);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
