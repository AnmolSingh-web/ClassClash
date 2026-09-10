const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const proof = await page.evaluate(() => {
    document.body.classList.add('dark');
    const nav = document.querySelector('.mobile-nav');
    const style = getComputedStyle(nav);
    return {
      display: style.display,
      background: style.backgroundColor,
      backdropFilter: style.backdropFilter,
      border: style.borderTopColor
    };
  });
  console.log('mobileNavDisplay=' + proof.display);
  console.log('mobileNavBackground=' + proof.background);
  console.log('mobileNavBackdrop=' + proof.backdropFilter);
  console.log('mobileNavBorder=' + proof.border);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
