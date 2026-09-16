const { chromium } = require('playwright');

const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

const schedule = {};
['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((d) => { schedule[d] = []; });
schedule[todayName] = [
  { subject: 'DS (BCS-301)', start: '09:30', end: '10:20', isBreak: false },
  { subject: 'LUNCH', start: '12:40', end: '13:30', isBreak: true },
  { subject: 'DSTL (BCS-303)', start: '13:30', end: '14:20', isBreak: false }
];

(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript((data) => {
    localStorage.clear();
    localStorage.setItem('classScheduleTrackerSchedule', JSON.stringify(data));
  }, schedule);
  await page.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  await page.waitForTimeout(400);
  const result = await page.evaluate(() => ({
    breakItemInList: Boolean(document.querySelector('#scheduleList .schedule-item.break-item')),
    breakInItinerary: Boolean(document.querySelector('#desktopItineraryList .itinerary-item.is-break')),
    itineraryBreakLabel: (document.querySelector('#desktopItineraryList .itinerary-item.is-break .itinerary-copy span') || {}).textContent || null,
    breakLabelText: (document.querySelector('#scheduleList .schedule-item.break-item .subject') || {}).textContent || null,
    itineraryCount: (document.querySelector('#desktopItineraryCount') || {}).textContent || null,
    priorityOptions: Array.from(document.querySelectorAll('#prioritySubjectSelect option')).map((o) => o.textContent)
  }));
  console.log('breakItemInList=' + result.breakItemInList);
  console.log('breakInItinerary=' + result.breakInItinerary);
  console.log('itineraryBreakLabel=' + result.itineraryBreakLabel);
  console.log('breakLabelText=' + result.breakLabelText);
  console.log('itineraryCount=' + result.itineraryCount);
  console.log('priorityHasLUNCH=' + result.priorityOptions.includes('LUNCH'));
  await browser.close();

  if (!result.breakItemInList || !result.breakInItinerary || result.itineraryBreakLabel !== 'Break') {
    throw new Error('Break rendering failed');
  }
  if (result.priorityHasLUNCH) {
    throw new Error('Break offered as priority subject');
  }
  console.log('OK: breaks render in schedule list and desktop itinerary.');
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
