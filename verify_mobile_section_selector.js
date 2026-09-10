const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const result = await page.locator('.mobile-section-picker').evaluate((element) => ({
    display: getComputedStyle(element).display,
    selectId: element.querySelector('select').id,
    disabled: element.querySelector('select').disabled
  }));
  console.log('mobileSectionPickerDisplay=' + result.display);
  console.log('mobileSectionSelectId=' + result.selectId);
  console.log('mobileSectionSelectDisabledInitially=' + result.disabled);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
