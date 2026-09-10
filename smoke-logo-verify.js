const { chromium } = require('playwright');
(async()=>{
  const browser = await chromium.launch({args:['--headless']});
  const page = await browser.newPage({viewport: { width: 390, height: 780 }});
  await page.goto('http://127.0.0.1:8000/index.html',{waituntil:'load',timeout:3000});
  const title = await page.title();
  const brand = (await page.locator('h1').textContent()).trim();
  const svgExists = await page.locator('svg.brand-logo-svg').count();
  const strokeOuter = await page.evaluate(() => getComputedStyle(document.querySelector('path.brand-logo-outer')).stroke);
  const strokeInner = await page.evaluate(() => getComputedStyle(document.querySelector('path.brand-logo-inner')).stroke);
  console.log('title=' + title);
  console.log('brand=' + brand);
  console.log('svgExists=' + svgExists);
  console.log('strokeOuter=' + strokeOuter);
  console.log('strokeInner=' + strokeInner);
  await browser.close();
})().catch((e)=>{
  console.log('NODE_ERROR=' + e.message);
  process.exit(1);
});
