const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const proof = await page.evaluate(() => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    const minute = now.getHours() * 60 + now.getMinutes();
    const toTime = (value) => `${String(Math.floor(value / 60) % 24).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    const emptySchedule = {};
    days.forEach((name) => { emptySchedule[name] = []; });
    emptySchedule[day] = [{ subject: 'Future Class', start: toTime(minute + 60), end: toTime(minute + 120) }];
    updateUI(emptySchedule);
    const emptyState = {
      indicatorHidden: document.querySelector('#currentClassIndicator').hidden,
      metaHidden: document.querySelector('#currentClassMeta').hidden,
      progressHidden: document.querySelector('#currentProgressWrap').hidden,
      className: document.querySelector('#currentClassName').textContent
    };
    const activeSchedule = {};
    days.forEach((name) => { activeSchedule[name] = []; });
    activeSchedule[day] = [{ subject: 'Active Class', start: toTime(minute - 10), end: toTime(minute + 10) }];
    updateUI(activeSchedule);
    const activeState = {
      indicatorHidden: document.querySelector('#currentClassIndicator').hidden,
      metaHidden: document.querySelector('#currentClassMeta').hidden,
      progressHidden: document.querySelector('#currentProgressWrap').hidden,
      progressWidth: document.querySelector('#currentProgressBar').style.width
    };
    return { emptyState, activeState };
  });
  console.log('emptyIndicatorHidden=' + proof.emptyState.indicatorHidden);
  console.log('emptyMetaHidden=' + proof.emptyState.metaHidden);
  console.log('emptyProgressHidden=' + proof.emptyState.progressHidden);
  console.log('emptyClassName=' + proof.emptyState.className);
  console.log('activeIndicatorHidden=' + proof.activeState.indicatorHidden);
  console.log('activeMetaHidden=' + proof.activeState.metaHidden);
  console.log('activeProgressHidden=' + proof.activeState.progressHidden);
  console.log('activeProgressWidth=' + proof.activeState.progressWidth);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
