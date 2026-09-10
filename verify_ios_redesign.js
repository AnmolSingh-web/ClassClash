const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--headless'] });
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const desktopProof = await desktop.evaluate(() => ({
    font: getComputedStyle(document.body).fontFamily,
    background: getComputedStyle(document.body).backgroundColor,
    cardBackground: getComputedStyle(document.querySelector('.class-card')).backgroundColor,
    nativeSelectClipped: getComputedStyle(document.querySelector('#sheetSelect')).clipPath,
    actionSheetHidden: document.querySelector('#actionSheetBackdrop').hidden
  }));
  await desktop.evaluate(() => {
    const select = document.querySelector('#sheetSelect');
    select.innerHTML = '<option value="section-a">Section A</option>';
    select.disabled = false;
    const button = document.querySelector('#sheetPickerButton');
    button.disabled = false;
  });
  await desktop.locator('#sheetPickerButton').click();
  const sheetVisible = await desktop.locator('#actionSheetBackdrop').evaluate((element) => !element.hidden && element.classList.contains('visible'));
  await desktop.locator('#closeActionSheet').click();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto('http://127.0.0.1:8000/index.html', { waituntil: 'load', timeout: 3000 });
  const mobileProof = await mobile.evaluate(() => ({
    navDisplay: getComputedStyle(document.querySelector('.mobile-nav')).display,
    navBackdrop: getComputedStyle(document.querySelector('.mobile-nav')).backdropFilter,
    pickerDisplay: getComputedStyle(document.querySelector('.mobile-section-picker')).display,
    mainPaddingBottom: getComputedStyle(document.querySelector('.main-content')).paddingBottom
  }));

  console.log('desktopFont=' + desktopProof.font);
  console.log('desktopBackground=' + desktopProof.background);
  console.log('cardBackground=' + desktopProof.cardBackground);
  console.log('nativeSelectClip=' + desktopProof.nativeSelectClipped);
  console.log('actionSheetInitiallyHidden=' + desktopProof.actionSheetHidden);
  console.log('actionSheetVisibleAfterOpen=' + sheetVisible);
  console.log('mobileNavDisplay=' + mobileProof.navDisplay);
  console.log('mobileNavBackdrop=' + mobileProof.navBackdrop);
  console.log('mobilePickerDisplay=' + mobileProof.pickerDisplay);
  console.log('mobileBottomPadding=' + mobileProof.mainPaddingBottom);
  await browser.close();
})().catch((error) => {
  console.log('NODE_ERROR=' + error.message);
  process.exit(1);
});
