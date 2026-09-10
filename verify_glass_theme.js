const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const proof = await page.evaluate(() => {
    document.body.classList.add('dark');
    const sample = (selector) => {
      const element = document.querySelector(selector);
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        backdropFilter: style.backdropFilter,
        borderColor: style.borderTopColor,
        boxShadow: style.boxShadow
      };
    };
    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      bodyBeforeBackground: getComputedStyle(document.body, '::before').backgroundColor,
      card: sample('.class-card'),
      sidebar: sample('.sidebar'),
      schedule: sample('.schedule-panel'),
      mobileNavRule: getComputedStyle(document.querySelector('.mobile-nav')).backdropFilter
    };
  });
  console.log('bodyBackground=' + proof.bodyBackground);
  console.log('bodyBeforeBackground=' + proof.bodyBeforeBackground);
  console.log('cardBackground=' + proof.card.background);
  console.log('cardBackdrop=' + proof.card.backdropFilter);
  console.log('cardBorder=' + proof.card.borderColor);
  console.log('cardShadow=' + proof.card.boxShadow);
  console.log('sidebarBackground=' + proof.sidebar.background);
  console.log('scheduleBackground=' + proof.schedule.background);
  console.log('mobileNavBackdrop=' + proof.mobileNavRule);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
