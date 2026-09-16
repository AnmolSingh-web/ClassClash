const fs = require('fs');
const vm = require('vm');
const XLSX = require('xlsx');

function el(id) {
  return {
    id,
    textContent: '',
    innerHTML: '',
    disabled: false,
    value: '',
    classList: { add() {}, remove() {}, toggle() {} },
    dataset: {},
    addEventListener() {},
    appendChild() {},
    closest() { return null; },
    files: []
  };
}

const ids = ['currentClassName','currentClassEnd','nextClassName','nextClassStart','statusMessage','fileInput','fileInputSettings','sheetSelect','scheduleList','savedScheduleLabel','activeDayScheduleTitle','todayDate','dayTitle','clockTime','clearSchedule','todayDateChip','enableNotifications','themeIcon','darkModeToggle','priorityInput','addPriority','priorityList','homeTab','scheduleTab','settingsTab'];
const elements = Object.fromEntries(ids.map(id => [id, el(id)]));

const document = {
  body: { classList: { add() {}, remove() {}, contains() { return false; } } },
  getElementById(id) { return elements[id] || el(id); },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};

const context = {
  console,
  Date,
  String,
  Number,
  Boolean,
  Object,
  Array,
  Math,
  Set,
  Map,
  RegExp,
  JSON,
  FileReader: undefined,
  localStorage: {
    storage: {},
    getItem(k) { return this.storage[k] || null; },
    setItem(k, v) { this.storage[k] = String(v); },
    removeItem(k) { delete this.storage[k]; }
  },
  window: { Notification: undefined },
  document,
  module: { exports: {} },
  exports: {},
  setInterval() { return 1; },
  XLSX
};

vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), context);
const parseMasterSheet = context.module.exports.parseMasterSheet;

const workbook = XLSX.readFile('timetable.xlsx');
let breakCount = 0;
let classCount = 0;
const breakNames = new Set();

for (const sheetName of workbook.SheetNames) {
  const { schedule } = parseMasterSheet(workbook.Sheets[sheetName]);
  for (const day of Object.keys(schedule)) {
    for (const item of schedule[day]) {
      if (item.isBreak) {
        breakCount += 1;
        breakNames.add(item.subject);
      } else {
        classCount += 1;
      }
      if (/minor\/honors|major\/minor/i.test(item.subject)) {
        throw new Error(`Ignored subject leaked into schedule: ${item.subject}`);
      }
    }
  }
}

console.log(`classes=${classCount}`);
console.log(`breaks=${breakCount}`);
console.log(`breakNames=${[...breakNames].join(' | ')}`);

if (breakCount === 0) {
  throw new Error('Expected break entries to be included in the schedule');
}

// Breaks must not be offered as priority notification subjects
const sample = { Monday: [{ subject: 'LUNCH', start: '12:40', end: '13:30', isBreak: true }, { subject: 'DS (BCS-301)', start: '09:30', end: '10:20', isBreak: false }] };
const subjects = context.module.exports.getSubjectsFromSchedule
  ? context.module.exports.getSubjectsFromSchedule(sample)
  : null;

if (subjects && subjects.includes('LUNCH')) {
  throw new Error('Break subject was offered as a priority subject');
}

console.log('OK: breaks are included in the schedule and excluded from priority subjects.');
