const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.evaluate(() => {
    const list = document.querySelector('#desktopItineraryList');
    list.innerHTML = '<article class="itinerary-item"><div class="itinerary-time"><strong>09:00</strong><span>10:00</span></div><div class="itinerary-rail"><span></span></div><div class="itinerary-copy"><strong>Sample Class</strong><span>First class</span></div></article>';
    document.querySelector('#desktopItineraryCount').textContent = '1 class';
  });
  const desktop = await page.evaluate(() => ({
    sidebarPosition: getComputedStyle(document.querySelector('.sidebar')).position,
    sidebarWidth: getComputedStyle(document.querySelector('.sidebar')).width,
    mainMargin: getComputedStyle(document.querySelector('.main-content')).marginLeft,
    mainWidth: getComputedStyle(document.querySelector('.main-content')).width,
    homeDisplay: getComputedStyle(document.querySelector('#homeTab')).display,
    itineraryDisplay: getComputedStyle(document.querySelector('.desktop-itinerary')).display,
    itineraryHeight: getComputedStyle(document.querySelector('.desktop-itinerary')).minHeight,
    timelineRows: document.querySelectorAll('.itinerary-item').length
  }));
  const mobile = await page.evaluate(() => {
    const media = window.matchMedia('(max-width: 900px)');
    return media.matches;
  });
  console.log('sidebarPosition=' + desktop.sidebarPosition);
  console.log('sidebarWidth=' + desktop.sidebarWidth);
  console.log('mainMargin=' + desktop.mainMargin);
  console.log('mainWidth=' + desktop.mainWidth);
  console.log('homeDisplay=' + desktop.homeDisplay);
  console.log('itineraryDisplay=' + desktop.itineraryDisplay);
  console.log('itineraryMinHeight=' + desktop.itineraryHeight);
  console.log('timelineRows=' + desktop.timelineRows);
  console.log('mobileMediaMatches=' + mobile);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
