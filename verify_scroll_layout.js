const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const desktop = await page.evaluate(() => {
    const shell = document.querySelector('.app-shell');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    return {
      shellHeight: getComputedStyle(shell).height,
      shellWidth: getComputedStyle(shell).width,
      shellOverflow: getComputedStyle(shell).overflow,
      sidebarPosition: getComputedStyle(sidebar).position,
      sidebarHeight: getComputedStyle(sidebar).height,
      sidebarOverflowY: getComputedStyle(sidebar).overflowY,
      sidebarScrollbarWidth: getComputedStyle(sidebar).scrollbarWidth,
      mainFlex: getComputedStyle(main).flex,
      mainHeight: getComputedStyle(main).height,
      mainOverflowY: getComputedStyle(main).overflowY,
      mainOverflowX: getComputedStyle(main).overflowX,
      mainMarginLeft: getComputedStyle(main).marginLeft,
      mainScrollbarWidth: getComputedStyle(main).scrollbarWidth
    };
  });
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const mobile = await mobilePage.evaluate(() => ({
    shellHeight: getComputedStyle(document.querySelector('.app-shell')).height,
    mainHeight: getComputedStyle(document.querySelector('.main-content')).height,
    mainOverflowY: getComputedStyle(document.querySelector('.main-content')).overflowY,
    bodyOverflowY: getComputedStyle(document.body).overflowY
  }));
  console.log('shellHeight=' + desktop.shellHeight);
  console.log('shellWidth=' + desktop.shellWidth);
  console.log('shellOverflow=' + desktop.shellOverflow);
  console.log('sidebarPosition=' + desktop.sidebarPosition);
  console.log('sidebarHeight=' + desktop.sidebarHeight);
  console.log('sidebarOverflowY=' + desktop.sidebarOverflowY);
  console.log('sidebarScrollbarWidth=' + desktop.sidebarScrollbarWidth);
  console.log('mainFlex=' + desktop.mainFlex);
  console.log('mainHeight=' + desktop.mainHeight);
  console.log('mainOverflowY=' + desktop.mainOverflowY);
  console.log('mainOverflowX=' + desktop.mainOverflowX);
  console.log('mainMarginLeft=' + desktop.mainMarginLeft);
  console.log('mainScrollbarWidth=' + desktop.mainScrollbarWidth);
  console.log('mobileShellHeight=' + mobile.shellHeight);
  console.log('mobileMainHeight=' + mobile.mainHeight);
  console.log('mobileMainOverflowY=' + mobile.mainOverflowY);
  console.log('mobileBodyOverflowY=' + mobile.bodyOverflowY);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
