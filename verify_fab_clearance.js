const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.evaluate(() => {
    document.querySelector('#scheduleList').innerHTML = '<div class="schedule-item"><div class="time">09:00 - 10:00</div><div class="subject">Sample Class</div></div>';
  });
  const proof = await page.evaluate(() => {
    const main = document.querySelector('.main-content');
    const scheduleTab = document.querySelector('.tab-schedule');
    const fab = document.querySelector('.schedule-floating-upload');
    return {
      mainPaddingBottom: getComputedStyle(main).paddingBottom,
      mainScrollPaddingBottom: getComputedStyle(main).scrollPaddingBottom,
      schedulePaddingBottom: getComputedStyle(scheduleTab).paddingBottom,
      fabBottom: getComputedStyle(fab).bottom,
      fabZIndex: getComputedStyle(fab).zIndex,
      timeGridColumn: getComputedStyle(document.querySelector('.schedule-item')).gridTemplateColumns
    };
  });
  console.log('mainPaddingBottom=' + proof.mainPaddingBottom);
  console.log('mainScrollPaddingBottom=' + proof.mainScrollPaddingBottom);
  console.log('schedulePaddingBottom=' + proof.schedulePaddingBottom);
  console.log('fabBottom=' + proof.fabBottom);
  console.log('fabZIndex=' + proof.fabZIndex);
  console.log('timeGridColumn=' + proof.timeGridColumn);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
