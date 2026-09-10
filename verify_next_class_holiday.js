const fs = require('fs');
const vm = require('vm');
const XLSX = require('xlsx');

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
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  window: { Notification: undefined },
  document: {
    body: { classList: { add() {}, remove() {}, contains() { return false; } } },
    getElementById() {
      return {
        textContent: '', innerHTML: '', disabled: false, value: '',
        classList: { add() {}, remove() {}, toggle() {} },
        dataset: {}, addEventListener() {}, appendChild() {}, closest() {}, files: []
      };
    },
    querySelectorAll() { return []; },
    querySelector() { return { classList: { toggle() {} } }; }
  },
  setInterval() { return 1; },
  XLSX,
  module: { exports: {} },
  exports: {}
};

vm.runInNewContext(fs.readFileSync('script.js', 'utf8'), context);
const findNext = context.module.exports.findNextClassFromSchedule;
const schedule = {
  Monday: [{ subject: 'Maths', start: '08:30', end: '09:20' }],
  Wednesday: [{ subject: 'Physics', start: '10:00', end: '10:50' }]
};
const result = findNext(schedule, 'Monday', 18 * 60, true);
if (!result || result.day !== 'Wednesday' || result.class.subject !== 'Physics') {
  throw new Error('Holiday skip failed: ' + JSON.stringify(result));
}
console.log('OK: holiday skip found Physics on Wednesday after empty Tuesday.');
