const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });

  const mobilePanelDisplay = await page.$eval('#homeTab .mobile-home-upload-panel', (el) => getComputedStyle(el).display);
  const sidebarUploadDisplay = await page.$eval('#fileInput', (el) => getComputedStyle(el.parentElement).display);
  const mobileDropDisplay = await page.$eval('#fileInputMobile', (el) => getComputedStyle(el).display);
  const mobileSelectDisplay = await page.$eval('#sheetSelectMobile', (el) => getComputedStyle(el.parentElement).display);

  console.log('mobilePanelDisplay=' + mobilePanelDisplay);
  console.log('sidebarUploadDisplay=' + sidebarUploadDisplay);
  console.log('mobileDropDisplay=' + mobileDropDisplay);
  console.log('mobileSelectDisplay=' + mobileSelectDisplay);

  await browser.close();
})().catch((e) => {
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
