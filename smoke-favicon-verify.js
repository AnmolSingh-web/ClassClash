const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({args:['--headless']});
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:8000/index.html',{waituntil:'load',timeout:3000});
  const icon = page.locator('link[rel="icon"]');
  const href = await icon.evaluate((node) => node.href);
  const type = await icon.evaluate((node) => node.type);
  console.log('faviconHref=' + href);
  console.log('faviconType=' + type);
  await browser.close();
})().catch((e)=>{
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
