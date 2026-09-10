const fs = require('fs');
const vm = require('vm');

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
elements.sheetSelect.innerHTML = '<option value="">Choose section</option>';

const document = {
  body: { classList: { add() {}, remove() {}, contains() { return false; } } },
  getElementById(id) { return elements[id] || el(id); },
  querySelector(selector) {
    if (selector === ".notification-card") {
      return { classList: { toggle() {} } };
    }
    return null;
  },
  querySelectorAll() { return []; }
};

const localStorage = {
  storage: {},
  getItem(k) { return this.storage[k] || null; },
  setItem(k, v) { this.storage[k] = String(v); },
  removeItem(k) { delete this.storage[k]; }
};

const workbook = {
  SheetNames: ['Sample'],
  Sheets: { Sample: {} }
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
  localStorage,
  window: { Notification: undefined },
  document,
  module: { exports: {} },
  exports: {},
  setInterval() { return 1; },
  XLSX: {
    read() { return workbook; },
    utils: {
      sheet_to_json() {
        return [
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, null, null],
          [null, '12.40 to 1:30', ''],
          [null, 'Monday', ''],
          ['Monday', 'Math', ''],
          ['Monday', 'Lab', ''],
          ['Monday', 'DBMS', ''],
          ['Monday', 'English', '']
        ];
      }
    }
  }
};

const code = fs.readFileSync('script.js', 'utf8');
vm.runInNewContext(code, context);

if (!context.module.exports.parseRange) {
  throw new Error('parseRange not exported');
}

if (!context.module.exports.findNextClassFromSchedule) {
  throw new Error('findNextClassFromSchedule not exported');
}

const first = context.module.exports.parseRange('12.40 to 1:30', false);
const second = context.module.exports.parseRange('1:30 to 2:20', true);

if (first.start !== '12:40' || first.end !== '13:30') {
  throw new Error('Cross-noon first range normalization failed: ' + JSON.stringify(first));
}

if (second.start !== '13:30' || second.end !== '14:20') {
  throw new Error('Cross-noon second range normalization failed: ' + JSON.stringify(second));
}

const crossDaySchedule = {
  Monday: [{ subject: 'Maths', start: '08:30', end: '09:20' }],
  Tuesday: [{ subject: 'Labs', start: '09:30', end: '10:20' }]
};

const crossDayNext = context.module.exports.findNextClassFromSchedule(crossDaySchedule, 'Monday', 9 * 60 + 50);
if (!crossDayNext || crossDayNext.subject !== 'Labs') {
  throw new Error('Cross-day next class lookup failed: ' + JSON.stringify(crossDayNext));
}

console.log('OK: smoke test passed; parseRange exports and range normalization verified.');
