const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.clear());
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({
    status: document.querySelector('#statusMessage').textContent.trim(),
    sheetDisabled: document.querySelector('#sheetSelect').disabled,
    sheetCount: document.querySelector('#sheetSelect').options.length - 1,
    uploadText: document.querySelector('#uploadText').textContent.trim()
  }));
  console.log('status=' + result.status);
  console.log('sheetDisabled=' + result.sheetDisabled);
  console.log('sheetCount=' + result.sheetCount);
  console.log('uploadText=' + result.uploadText);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
