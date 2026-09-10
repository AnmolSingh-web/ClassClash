const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (message) => console.log('browserConsole=' + message.text()));
  page.on('pageerror', (error) => console.log('pageError=' + error.message));
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.locator('#fileInput').setInputFiles(path.join(process.cwd(), 'timetable.xlsx'));
  await page.waitForTimeout(500);
  const result = await page.evaluate(() => ({
    status: document.querySelector('#statusMessage').textContent.trim(),
    uploadText: document.querySelector('#uploadText').textContent.trim(),
    sheetDisabled: document.querySelector('#sheetSelect').disabled,
    sheetOptions: Array.from(document.querySelector('#sheetSelect').options).map((option) => option.textContent),
    savedLabel: document.querySelector('#savedScheduleLabel').textContent.trim()
  }));
  console.log('status=' + result.status);
  console.log('uploadText=' + result.uploadText);
  console.log('sheetDisabled=' + result.sheetDisabled);
  console.log('sheetOptions=' + result.sheetOptions.join('|'));
  console.log('savedLabel=' + result.savedLabel);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
