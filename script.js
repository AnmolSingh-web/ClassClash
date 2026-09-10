const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const storageKey = "classScheduleTrackerSchedule";
const priorityStorageKey = "smartTimetablePrioritySubjects";
const notificationKey = "smartTimetablePriorityNotifications";
let currentWorkbook = null;

const currentClassName = document.getElementById("currentClassName");
const currentClassEnd = document.getElementById("currentClassEnd");
const currentClassMeta = document.getElementById("currentClassMeta");
const currentClassIndicator = document.getElementById("currentClassIndicator");
const currentProgressWrap = document.getElementById("currentProgressWrap");
const currentProgressBar = document.getElementById("currentProgressBar");
const desktopItineraryList = document.getElementById("desktopItineraryList");
const desktopItineraryCount = document.getElementById("desktopItineraryCount");
const nextClassName = document.getElementById("nextClassName");
const nextClassStart = document.getElementById("nextClassStart");
const statusMessage = document.getElementById("statusMessage");
const fileInput = document.getElementById("fileInput");
const fileInputMobile = document.getElementById("fileInputMobile");
const fileInputSettings = document.getElementById("fileInputSettings");
const fileInputSettingsMobile = document.getElementById("fileInputSettingsMobile");
const fileInputScheduleMobile = document.getElementById("fileInputScheduleMobile");
const sheetSelect = document.getElementById("sheetSelect");
const sheetSelectMobile = document.getElementById("sheetSelectMobile");
const sheetPickerButton = document.getElementById("sheetPickerButton");
const sheetPickerButtonMobile = document.getElementById("sheetPickerButtonMobile");
const scheduleList = document.getElementById("scheduleList");
const savedScheduleLabel = document.getElementById("savedScheduleLabel");
const activeDayScheduleTitle = document.getElementById("activeDayScheduleTitle");
const todayDate = document.getElementById("todayDate");
const todayDateChip = document.getElementById("todayDateChip");
const dayTitle = document.getElementById("dayTitle");
const clockTime = document.getElementById("clockTime");
const clearSchedule = document.getElementById("clearSchedule");
const enableNotifications = document.getElementById("enableNotifications");
const notificationToggle = document.getElementById("notificationToggle");
const darkModeToggle = document.getElementById("darkModeToggle");
const prioritySubjectSelect = document.getElementById("prioritySubjectSelect");
const addPriority = document.getElementById("addPriority");
const priorityList = document.getElementById("priorityList");
const notificationCard = document.querySelector ? document.querySelector(".notification-card") : null;
const homeTab = document.getElementById("homeTab");
const scheduleTab = document.getElementById("scheduleTab");
const settingsTab = document.getElementById("settingsTab");
const uploadText = document.getElementById("uploadText");
const uploadSubtext = document.getElementById("uploadSubtext");
const uploadTextMobile = document.getElementById("uploadTextMobile");
const uploadSubtextMobile = document.getElementById("uploadSubtextMobile");
const priorityPickerButton = document.getElementById("priorityPickerButton");
const actionSheetBackdrop = document.getElementById("actionSheetBackdrop");
const actionSheetTitle = document.getElementById("actionSheetTitle");
const actionSheetOptions = document.getElementById("actionSheetOptions");
const closeActionSheet = document.getElementById("closeActionSheet");
let activePicker = null;

function loadSavedSchedule() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function saveSchedule(schedule) {
  localStorage.setItem(storageKey, JSON.stringify(schedule));
}

function displaySavedStatus(schedule) {
  if (!schedule) {
    savedScheduleLabel.textContent = "No schedule saved";
    return;
  }

  const loadedDays = DAY_ORDER.filter((day) => schedule[day] && schedule[day].length > 0);
  if (loadedDays.length >= 1) {
    savedScheduleLabel.textContent = `${loadedDays.length} day${loadedDays.length > 1 ? "s" : ""} loaded`;
  } else {
    savedScheduleLabel.textContent = "Schedule loaded";
  }
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

async function loadWorkbookFromFile(file) {
  if (!file) return null;

  try {
    const buffer = await fileToArrayBuffer(file);
    currentWorkbook = XLSX.read(buffer, { type: "array" });
    const sheetNames = currentWorkbook.SheetNames || [];

    if (!sheetNames.length) {
      statusMessage.textContent = "No sheets found in the uploaded workbook.";
      return null;
    }

    populateSheetSelect(sheetNames);

    if (sheetNames.length === 1) {
      const selectedSheet = sheetNames[0];
      const parsed = parseMasterSheet(currentWorkbook.Sheets[selectedSheet]);

      if (!parsed || parsed.totalClasses === 0) {
        statusMessage.textContent = "No valid timetable rows were found in the selected sheet.";
        return null;
      }

      syncSelectedSheetValue(selectedSheet);
      saveSchedule(parsed.schedule);
      displaySavedStatus(parsed.schedule);
      renderSchedule(parsed.schedule);
      renderDesktopItinerary(parsed.schedule);
      updateUI(parsed.schedule);
      populatePrioritySubjectSelect(parsed.schedule);
      statusMessage.textContent = `Schedule loaded: ${parsed.totalClasses} classes found on ${selectedSheet}.`;

      if (uploadText) uploadText.textContent = "Update timetable";
      if (uploadSubtext) uploadSubtext.textContent = "Workbook loaded";

      applySubjectAccessState();
      return parsed.schedule;
    }

    statusMessage.textContent = "Please select your section first.";
    return null;
  } catch (e) {
    statusMessage.textContent = "The uploaded file could not be read. Please use a valid .xlsx or .xls timetable.";
    return null;
  }
}

async function handleUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  await loadWorkbookFromFile(file);
}

async function handleSettingsUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  await loadWorkbookFromFile(file);
}

function populateSheetSelect(sheetNames) {
  const makeSelect = (select) => {
    if (!select) return;
    select.innerHTML = `<option value="">Choose section</option>`;
    sheetNames.forEach((sheetName) => {
      const option = document.createElement("option");
      option.value = sheetName;
      option.textContent = sheetName;
      select.appendChild(option);
    });
    select.disabled = false;
  };

  makeSelect(sheetSelect);
  makeSelect(sheetSelectMobile);
  updatePickerButton(sheetPickerButton, "Choose section", false);
  updatePickerButton(sheetPickerButtonMobile, "Choose section", false);
}

function updatePickerButton(button, label, disabled) {
  if (!button) return;
  const text = typeof button.querySelector === "function" ? button.querySelector("span") : null;
  if (text) {
    text.textContent = label || "Choose section";
  } else if ("textContent" in button) {
    button.textContent = label || "Choose section";
  }
  button.disabled = Boolean(disabled);
}

function openActionSheet(type) {
  const source = type === "priority" ? prioritySubjectSelect : sheetSelect;
  if (!source || source.disabled || !actionSheetBackdrop || !actionSheetOptions) return;

  activePicker = type;
  actionSheetTitle.textContent = type === "priority" ? "Choose priority subject" : "Choose section";
  actionSheetOptions.innerHTML = Array.from(source.options).filter((option) => option.value).map((option) => `
    <button type="button" class="action-sheet-option${option.value === source.value ? " selected" : ""}" data-picker-value="${escapeHTML(option.value)}">
      <span>${escapeHTML(option.textContent)}</span><span class="option-check">${option.value === source.value ? "✓" : ""}</span>
    </button>
  `).join("");
  actionSheetBackdrop.hidden = false;
  requestAnimationFrame(() => actionSheetBackdrop.classList.add("visible"));
}

function closePickerSheet() {
  if (!actionSheetBackdrop) return;
  actionSheetBackdrop.classList.remove("visible");
  setTimeout(() => { actionSheetBackdrop.hidden = true; }, 180);
  activePicker = null;
}

function selectFromActionSheet(value) {
  const source = activePicker === "priority" ? prioritySubjectSelect : sheetSelect;
  if (!source) return;
  source.value = value;
  source.dispatchEvent(new Event("change", { bubbles: true }));
  closePickerSheet();
}

function openTab(tabName) {
  const selected = String(tabName || "home");
  const map = {
    home: homeTab,
    schedule: scheduleTab,
    settings: settingsTab
  };

  Object.entries(map).forEach(([key, el]) => {
    if (key === selected) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });

  document.querySelectorAll(".nav-link, .mobile-nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === selected);
  });
}

function syncThemeMode(isDark) {
  const shouldDark = Boolean(isDark);
  if (shouldDark) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  localStorage.setItem("smartTimetableTheme", shouldDark ? "dark" : "light");
}

function loadPrioritySubjects() {
  try {
    const stored = localStorage.getItem(priorityStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function savePrioritySubjects(list) {
  localStorage.setItem(priorityStorageKey, JSON.stringify(list));
}

function getSubjectsFromSchedule(schedule) {
  const all = [];
  DAY_ORDER.forEach((day) => {
    const classes = schedule[day] || [];
    classes.forEach((item) => {
      const subject = normalizeSubject(item.subject || "");
      if (!subject || all.includes(subject)) return;
      all.push(subject);
    });
  });
  return all.sort((a, b) => a.localeCompare(b));
}

function populatePrioritySubjectSelect(schedule) {
  if (!prioritySubjectSelect) return;

  const subjects = getSubjectsFromSchedule(schedule || initializeSchedule());
  prioritySubjectSelect.innerHTML = `<option value="">Choose subject of your section</option>`;
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    prioritySubjectSelect.appendChild(option);
  });
}

function renderPrioritySubjects() {
  const subjects = loadPrioritySubjects();
  if (!priorityList) return;

  if (!subjects.length) {
    priorityList.innerHTML = `<div class="empty-state">No priority subjects selected</div>`;
    return;
  }

  priorityList.innerHTML = subjects.map((subject) => `
    <span class="priority-chip">
      <span>${escapeHTML(subject)}</span>
      <button type="button" data-priority-remove="${escapeHTML(subject)}">×</button>
    </span>
  `).join("");
}

function addPrioritySubject(subject) {
  const raw = String(subject || "").trim().toUpperCase();
  if (!raw) return;

  const subjects = loadPrioritySubjects();
  if (!subjects.includes(raw)) {
    subjects.push(raw);
    savePrioritySubjects(subjects);
    renderPrioritySubjects();
  }
}

function removePrioritySubject(subject) {
  const raw = String(subject || "").trim().toUpperCase();
  const subjects = loadPrioritySubjects().filter((item) => item !== raw);
  savePrioritySubjects(subjects);
  renderPrioritySubjects();
}

function maybeNotifyPrioritySubject(schedule) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const today = DAYS[new Date().getDay()];
  const classes = schedule[today] || [];
  const subjects = loadPrioritySubjects();
  if (!classes.length || !subjects.length) return;

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextClass = findNextClass(classes, nowMinutes);
  if (!nextClass || !subjects.includes(nextClass.subject.toUpperCase())) return;

  const nextStart = timeStringToMinutes(nextClass.start);
  const delta = nextStart - nowMinutes;
  if (delta >= 0 && delta <= 5) {
    const noteKey = `${today}-${nextClass.subject}-${nextClass.start}`;
    const sent = localStorage.getItem(notificationKey);
    if (sent === noteKey) return;

    new Notification(`Priority class soon`, {
      body: `${nextClass.subject} starts at ${formatDisplayTime(nextClass.start)}`
    });
    localStorage.setItem(notificationKey, noteKey);
  }
}

function parseMasterSheet(sheet) {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
  if (!rows || rows.length < 8) {
    return { schedule: initializeSchedule(), totalClasses: 0 };
  }

  const timeRowIndex = rows.findIndex((row) => getTimeSlotColumns(row).length > 0);
  if (timeRowIndex < 0) {
    return { schedule: initializeSchedule(), totalClasses: 0 };
  }

  const timeRow = rows[timeRowIndex] || [];
  const slotColumns = getTimeSlotColumns(timeRow);
  if (slotColumns.length === 0) {
    return { schedule: initializeSchedule(), totalClasses: 0 };
  }

  const slots = extractSlots(timeRow, slotColumns);
  const schedule = initializeSchedule();

  for (let r = timeRowIndex + 1; r < rows.length; r++) {
    const dayRow = rows[r] || [];
    if (!dayRow[0]) continue;

    const day = parseDayName(dayRow[0]);
    if (!day) continue;

    slots.forEach((slot) => {
      const subjectCell = dayRow[slot.columnIndex];
      if (!subjectCell && subjectCell !== 0) return;

      const subject = normalizeSubject(subjectCell);
      if (!subject || looksLikeIgnoredSubject(subject)) return;

      schedule[day].push({
        subject,
        start: slot.start,
        end: slot.end
      });
    });
  }

  for (const day of DAY_ORDER) {
    schedule[day].sort((a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start));
  }

  const totalClasses = DAY_ORDER.reduce((count, day) => count + schedule[day].length, 0);
  return { schedule, totalClasses };
}

function getTimeSlotColumns(timeRow) {
  const columns = [];
  for (let col = 0; col < timeRow.length; col++) {
    const display = normalizeCell(timeRow[col]);
    if (!display) continue;

    if (looksLikeTimeRange(display)) {
      columns.push(col);
    }
  }
  return columns;
}

function looksLikeTimeRange(value) {
  return /\d{1,2}(?:\.|:)\d{1,2}\s*(?:to|-|–|—)\s*\d{1,2}(?:\.|:)\d{1,2}/i.test(value);
}

function normalizeCell(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function extractSlots(timeRow, columns) {
  let afternoonFlag = false;
  const slots = [];

  columns.forEach((col) => {
    const raw = normalizeCell(timeRow[col]);
    if (!raw) return;

    const rangeText = raw.replace(/\u2013|\u2014/g, "-");
    const parsed = parseRange(rangeText, afternoonFlag);

    if (parsed.crossAfternoon) {
      afternoonFlag = true;
    }

    slots.push({
      columnIndex: col,
      columnIndexMap: col,
      start: parsed.start,
      end: parsed.end,
      subject: ""
    });
  });

  return slots;
}

function parseRange(rangeText, afternoonFlag) {
  const cleanText = normalizeCell(rangeText).replace(/\u2013|\u2014/g, "-");
  const match = cleanText.match(/(\d{1,2})\s*[.: ]\s*(\d{2})\s*(?:to|-|–|—)\s*(\d{1,2})\s*[.: ]\s*(\d{2})/i);
  if (!match) return { start: "", end: "", crossAfternoon: false };

  let startHour = Number(match[1]);
  const startMinute = Number(match[2]);
  let endHour = Number(match[3]);
  const endMinute = Number(match[4]);

  let crossAfternoon = false;

  if (afternoonFlag) {
    if (startHour < 12) startHour += 12;
    if (endHour < 12) endHour += 12;
  }

  if (!afternoonFlag && startHour >= 12 && endHour < startHour) {
    endHour += 12;
    crossAfternoon = true;
  }

  const start = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`;
  const end = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;

  return {
    start,
    end,
    crossAfternoon
  };
}

function parseDayName(value) {
  const text = normalizeCell(value).toLowerCase();
  if (!text) return null;

  if (text.includes("monday")) return "Monday";
  if (text.includes("tuesday")) return "Tuesday";
  if (text.includes("wednesday")) return "Wednesday";
  if (text.includes("thursday")) return "Thursday";
  if (text.includes("friday")) return "Friday";
  if (text.includes("saturday")) return "Saturday";
  if (text.includes("sunday")) return "Sunday";

  return null;
}

function updateScheduleMessages(schedule) {
  if (!schedule) {
    statusMessage.textContent = "Please upload the time table and select your section first.";
    return;
  }

  const hasAnyDay = DAY_ORDER.some((day) => schedule[day] && schedule[day].length > 0);
  if (!hasAnyDay) {
    statusMessage.textContent = "Please upload the time table and select your section first.";
  }
}

function looksLikeIgnoredSubject(subject) {
  const text = normalizeSubject(subject).toLowerCase();
  if (!text) return true;

  return (
    text.includes("break") ||
    text.includes("lunch") ||
    text.includes("mentorship") ||
    text.includes("minor/honors")
  );
}

function normalizeSubject(value) {
  if (!value && value !== 0) return "";

  let text = String(value)
    .replace(/\n/g, " ")
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Trim merged-cell room/group suffixes such as:
  // AI LAB (BCS-751) 4IT-1 G1 Project Lab Mini Project (BIT-752) 4IT-1 G2 Lab4
  // so the parser keeps only the real subject token and drops appended lab/project metadata.
  text = text.replace(/\s+4IT-\d+\s*G\d+\s+.*$/i, "");
  text = text.replace(/\s+Class Room.*$/i, "");

  return text
    .split(" - ")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" - ")
    .trim();
}

function initializeSchedule() {
  const schedule = {};
  DAY_ORDER.forEach((day) => {
    schedule[day] = [];
  });
  return schedule;
}

function renderSchedule(schedule) {
  const today = DAYS[new Date().getDay()];
  activeDayScheduleTitle.textContent = today;

  const day = today;
  const classes = schedule[day] || [];

  if (classes.length === 0) {
    scheduleList.innerHTML = `<div class="empty-state">No classes scheduled for ${day}</div>`;
    return;
  }

  scheduleList.innerHTML = classes.map((c) => `<div class="schedule-item">
    <div class="time">${formatDisplayTime(c.start)} - ${formatDisplayTime(c.end)}</div>
    <div class="subject">${escapeHTML(c.subject)}</div>
  </div>`).join("");
}

function renderDesktopItinerary(schedule) {
  if (!desktopItineraryList || !desktopItineraryCount) return;

  const today = DAYS[new Date().getDay()];
  const classes = (schedule && schedule[today] ? schedule[today] : [])
    .slice()
    .sort((a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start));

  desktopItineraryCount.textContent = `${classes.length} class${classes.length === 1 ? "" : "es"}`;
  if (!classes.length) {
    desktopItineraryList.innerHTML = `<div class="empty-state">No classes scheduled for ${today}.</div>`;
    return;
  }

  desktopItineraryList.innerHTML = classes.map((item, index) => `
    <article class="itinerary-item">
      <div class="itinerary-time">
        <strong>${formatDisplayTime(item.start)}</strong>
        <span>${formatDisplayTime(item.end)}</span>
      </div>
      <div class="itinerary-rail" aria-hidden="true"><span></span></div>
      <div class="itinerary-copy">
        <strong>${escapeHTML(item.subject)}</strong>
        <span>${index === 0 ? "First class" : `Class ${index + 1} of ${classes.length}`}</span>
      </div>
    </article>
  `).join("");
}

function findNextClassFromSchedule(schedule, todayName, currentMinute, includeDay = false) {
  const todayIndex = DAY_ORDER.indexOf(todayName);
  if (todayIndex < 0) return null;

  for (let offset = 0; offset < DAY_ORDER.length; offset++) {
    const day = DAY_ORDER[(todayIndex + offset) % DAY_ORDER.length];
    const classes = schedule[day] || [];
    if (!classes.length) continue;

    if (offset === 0) {
      const future = classes.filter((cls) => timeStringToMinutes(cls.start) > currentMinute);
      if (future.length) {
        future.sort((a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start));
        return includeDay ? { day, class: future[0] } : future[0];
      }
      continue;
    }

    return classes[0] ? (includeDay ? { day, class: classes[0] } : classes[0]) : null;
  }

  return null;
}

function formatCountdown(minutesLeft) {
  const hours = Math.floor(minutesLeft / 60);
  const mins = minutesLeft % 60;
  if (hours === 0) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  if (mins === 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }
  return `${hours} hour${hours === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
}

function setCurrentClassState(name, endTime = "--:--", isActive = false, progress = 0) {
  currentClassName.textContent = name;
  currentClassEnd.textContent = endTime;
  currentClassMeta.hidden = !isActive;
  currentProgressWrap.hidden = !isActive;
  currentClassIndicator.hidden = !isActive;
  if (currentProgressBar && currentProgressBar.style) {
    currentProgressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }
}

function updateUI(schedule) {
  const now = new Date();
  const todayName = DAYS[now.getDay()];
  const todaySchedule = schedule[todayName] || [];

  dayTitle.textContent = todayName;
  todayDate.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const currentClass = findCurrentClass(todaySchedule, currentMinute);
  const nextClass = findNextClass(todaySchedule, currentMinute);

  if (["Saturday", "Sunday"].includes(todayName)) {
    const nextWeekendClass = findNextClassFromSchedule(schedule, todayName, currentMinute, true);
    setCurrentClassState("Weekend");
    if (nextWeekendClass) {
      nextClassName.textContent = nextWeekendClass.class.subject;
      nextClassStart.textContent = `${nextWeekendClass.day}, ${formatDisplayTime(nextWeekendClass.class.start)}`;
      statusMessage.textContent = `Weekend. Next class: ${nextWeekendClass.class.subject} on ${nextWeekendClass.day}.`;
    } else {
      nextClassName.textContent = "No upcoming classes";
      nextClassStart.textContent = "--:--";
      statusMessage.textContent = "Weekend - No upcoming classes found.";
    }
    activeDayScheduleTitle.textContent = todayName;
    return;
  }

  if (!todaySchedule.length) {
    const nextHolidayClass = findNextClassFromSchedule(schedule, todayName, currentMinute, true);
    setCurrentClassState("Relax! The day is over.");
    if (nextHolidayClass) {
      nextClassName.textContent = nextHolidayClass.class.subject;
      nextClassStart.textContent = `${nextHolidayClass.day}, ${formatDisplayTime(nextHolidayClass.class.start)}`;
      statusMessage.textContent = `Holiday. Next class: ${nextHolidayClass.class.subject} on ${nextHolidayClass.day}.`;
    } else {
      nextClassName.textContent = "No upcoming classes";
      nextClassStart.textContent = "--:--";
      statusMessage.textContent = "Relax! The day is over.";
    }
    return;
  }

  const firstClass = todaySchedule[0];
  const lastClass = todaySchedule[todaySchedule.length - 1];
  const firstStart = timeStringToMinutes(firstClass.start);
  const lastEnd = timeStringToMinutes(lastClass.end);

  if (currentMinute < firstStart) {
    setCurrentClassState("Get Ready! Soldier.");

    if (nextClass) {
      nextClassName.textContent = nextClass.subject;
      nextClassStart.textContent = formatDisplayTime(nextClass.start);
      const minutesToClass = Math.max(0, timeStringToMinutes(nextClass.start) - currentMinute);
      statusMessage.textContent = `Get Ready! Soldier. War begins in ${formatCountdown(minutesToClass)}.`;
    } else {
      nextClassName.textContent = "No next class";
      nextClassStart.textContent = "--:--";
      statusMessage.textContent = "Get Ready! Soldier. War begins soon.";
    }
    return;
  }

  if (currentMinute >= lastEnd) {
    const nextDayClass = findNextClassFromSchedule(schedule, todayName, currentMinute, true);
    if (nextDayClass) {
      setCurrentClassState("Day Over");
      nextClassName.textContent = nextDayClass.class.subject;
      nextClassStart.textContent = `${nextDayClass.day}, ${formatDisplayTime(nextDayClass.class.start)}`;
      statusMessage.textContent = `Day over. Next class: ${nextDayClass.class.subject} on ${nextDayClass.day}.`;
      return;
    }

    setCurrentClassState("Relax! The day is over.");
    nextClassName.textContent = "--";
    nextClassStart.textContent = "--:--";
    statusMessage.textContent = "Relax! The day is over.";
    return;
  }

  if (currentClass) {
    const start = timeStringToMinutes(currentClass.start);
    const end = timeStringToMinutes(currentClass.end);
    const progress = end > start ? ((currentMinute - start) / (end - start)) * 100 : 0;
    setCurrentClassState(currentClass.subject, formatDisplayTime(currentClass.end), true, progress);

    const nextAfterCurrent = findNextClass(todaySchedule, timeStringToMinutes(currentClass.end));
    if (nextAfterCurrent) {
      nextClassName.textContent = nextAfterCurrent.subject;
      nextClassStart.textContent = formatDisplayTime(nextAfterCurrent.start);
    } else {
      nextClassName.textContent = "Classes over for the day";
      nextClassStart.textContent = "--:--";
    }

    statusMessage.textContent = `In class: ${currentClass.subject}.`;
  } else {
    setCurrentClassState("Free Period");

    if (nextClass) {
      nextClassName.textContent = nextClass.subject;
      nextClassStart.textContent = formatDisplayTime(nextClass.start);

      const minutesToClass = Math.max(0, timeStringToMinutes(nextClass.start) - currentMinute);
      statusMessage.textContent = `Get Ready! Soldier. War begins in ${formatCountdown(minutesToClass)}.`;
    } else {
      nextClassName.textContent = "Classes over for the day";
      nextClassStart.textContent = "--:--";
      statusMessage.textContent = "Relax! The day is over.";
    }
  }
}

function findCurrentClass(todaySchedule, currentMinute) {
  return todaySchedule.find((cls) => {
    return currentMinute >= timeStringToMinutes(cls.start) && currentMinute < timeStringToMinutes(cls.end);
  }) || null;
}

function findNextClass(todaySchedule, currentMinute) {
  const future = todaySchedule.filter((cls) => timeStringToMinutes(cls.start) > currentMinute);
  if (!future.length) return null;

  future.sort((a, b) => timeStringToMinutes(a.start) - timeStringToMinutes(b.start));
  return future[0];
}

function timeStringToMinutes(value) {
  if (!value || !value.includes(":")) return 24 * 60 + 60;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatDisplayTime(time) {
  if (!time || !time.includes(":")) return "--:--";

  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "--:--";

  return `${String(h)}:${String(m).padStart(2, "0")}`;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function updateClock() {
  const now = new Date();
  clockTime.textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function resetSchedule() {
  localStorage.removeItem(storageKey);
  scheduleList.innerHTML = `<div class="empty-state">No classes available</div>`;
  setCurrentClassState("Upload a timetable");
  nextClassName.textContent = "--";
  nextClassStart.textContent = "--:--";
  statusMessage.textContent = "Upload your timetable to begin.";
  savedScheduleLabel.textContent = "No schedule saved";

  if (sheetSelect) {
    sheetSelect.disabled = true;
    sheetSelect.innerHTML = `<option value="">Choose section</option>`;
  }

  if (sheetSelectMobile) {
    sheetSelectMobile.disabled = true;
    sheetSelectMobile.innerHTML = `<option value="">Choose section</option>`;
  }

  updatePickerButton(sheetPickerButton, "Choose section", true);
  updatePickerButton(sheetPickerButtonMobile, "Choose section", true);

  if (uploadText) uploadText.textContent = "Upload timetable";
  if (uploadSubtext) uploadSubtext.textContent = ".xlsx / .xls";
  if (uploadTextMobile) uploadTextMobile.textContent = "Upload timetable";
  if (uploadSubtextMobile) uploadSubtextMobile.textContent = ".xlsx / .xls";
}

function syncSelectedSheetValue(value) {
  if (sheetSelect) sheetSelect.value = value || "";
  if (sheetSelectMobile) sheetSelectMobile.value = value || "";
  const label = value || "Choose section";
  updatePickerButton(sheetPickerButton, label, !value);
  updatePickerButton(sheetPickerButtonMobile, label, !value);
}

function handleSheetSelection(selectValue) {
  if (!currentWorkbook) {
    statusMessage.textContent = "Please upload the time table and select your section first.";
    return;
  }

  if (!selectValue) {
    statusMessage.textContent = "Please select your section first.";
    return;
  }

  const parsed = parseMasterSheet(currentWorkbook.Sheets[selectValue]);

  if (!parsed || parsed.totalClasses === 0) {
    statusMessage.textContent = "No valid timetable rows were found in the selected sheet.";
    return;
  }

  saveSchedule(parsed.schedule);
  displaySavedStatus(parsed.schedule);
  renderSchedule(parsed.schedule);
  renderDesktopItinerary(parsed.schedule);
  updateUI(parsed.schedule);
  populatePrioritySubjectSelect(parsed.schedule);
  statusMessage.textContent = `Schedule loaded: ${parsed.totalClasses} classes found on ${selectValue}.`;
  applySubjectAccessState();
}

sheetSelect.addEventListener("change", () => {
  const chosen = sheetSelect.value || (sheetSelectMobile && sheetSelectMobile.value) || "";
  syncSelectedSheetValue(chosen);
  handleSheetSelection(chosen);
});

if (sheetSelectMobile) {
  sheetSelectMobile.addEventListener("change", () => {
    const chosen = sheetSelectMobile.value || (sheetSelect && sheetSelect.value) || "";
    syncSelectedSheetValue(chosen);
    handleSheetSelection(chosen);
  });
}

function applySubjectAccessState() {
  const hasWorkbook = Boolean(currentWorkbook || loadSavedSchedule());
  const hasSheet = Boolean(sheetSelect && sheetSelect.value);
  const notificationsOn = Boolean(notificationToggle && notificationToggle.checked);

  if (notificationCard) {
    notificationCard.classList.toggle("faded", !notificationsOn);
  }

  if (prioritySubjectSelect) {
    prioritySubjectSelect.disabled = !(hasWorkbook && hasSheet && notificationsOn);
  }

  updatePickerButton(
    priorityPickerButton,
    prioritySubjectSelect && prioritySubjectSelect.value ? prioritySubjectSelect.value : "Choose subject",
    !(hasWorkbook && hasSheet && notificationsOn)
  );

  if (addPriority) {
    addPriority.disabled = !(hasWorkbook && hasSheet && notificationsOn);
  }

  if (!hasWorkbook && prioritySubjectSelect) {
    prioritySubjectSelect.innerHTML = `<option value="">Choose subject of your section</option>`;
  }

  if (hasWorkbook && !hasSheet && prioritySubjectSelect) {
    prioritySubjectSelect.innerHTML = `<option value="">Choose subject of your section</option>`;
  }
}

function init() {
  const saved = loadSavedSchedule();
  displaySavedStatus(saved);

  if (saved) {
    renderSchedule(saved);
    renderDesktopItinerary(saved);
    updateUI(saved);
    populatePrioritySubjectSelect(saved);
    if (uploadText) uploadText.textContent = "Update timetable";
    if (uploadSubtext) uploadSubtext.textContent = "Workbook loaded";
  } else {
    setCurrentClassState("Upload a timetable");
    statusMessage.textContent = "Please upload the time table and select your section first.";
    if (uploadText) uploadText.textContent = "Upload timetable";
    if (uploadSubtext) uploadSubtext.textContent = ".xlsx / .xls";
  }

  const storedTheme = localStorage.getItem("smartTimetableTheme");
  syncThemeMode(storedTheme === "dark");

  renderPrioritySubjects();

  fileInput.addEventListener("change", handleUpload);
  if (fileInputMobile) fileInputMobile.addEventListener("change", handleUpload);
  if (fileInputSettings) fileInputSettings.addEventListener("change", handleSettingsUpload);
  if (fileInputSettingsMobile) fileInputSettingsMobile.addEventListener("change", handleSettingsUpload);
  if (fileInputScheduleMobile) fileInputScheduleMobile.addEventListener("change", handleSettingsUpload);
  clearSchedule.addEventListener("click", resetSchedule);

  document.querySelectorAll(".nav-link, .mobile-nav-item").forEach((button) => {
    button.addEventListener("click", () => openTab(button.dataset.tab));
  });

  if (darkModeToggle) {
    darkModeToggle.checked = document.body.classList.contains("dark");
    darkModeToggle.addEventListener("change", () => {
      syncThemeMode(darkModeToggle.checked);
    });
  }

  if (addPriority) {
    addPriority.addEventListener("click", () => {
      const chosen = prioritySubjectSelect && prioritySubjectSelect.value ? prioritySubjectSelect.value : '';
      if (!chosen) {
        statusMessage.textContent = "Please upload the time table and select your section first.";
        return;
      }
      addPrioritySubject(chosen);
      if (prioritySubjectSelect) prioritySubjectSelect.value = '';
      updatePickerButton(priorityPickerButton, "Choose subject", false);
    });
  }

  if (priorityList) {
    priorityList.addEventListener("click", (event) => {
      const remove = event.target.closest("[data-priority-remove]");
      if (!remove) return;
      removePrioritySubject(remove.dataset.priorityRemove);
    });
  }

  if (notificationToggle) {
    notificationToggle.checked = localStorage.getItem("smartTimetableNotificationEnabled") === "true";
    notificationToggle.addEventListener("change", () => {
      localStorage.setItem("smartTimetableNotificationEnabled", notificationToggle.checked ? "true" : "false");
      if (notificationToggle.checked) {
        statusMessage.textContent = "Priority notification system is ON.";
      } else {
        statusMessage.textContent = "Priority notification system is OFF.";
      }
      applySubjectAccessState();
    });
  }

  if (enableNotifications) {
    enableNotifications.addEventListener("click", async () => {
      if (!("Notification" in window)) {
        statusMessage.textContent = "Browser notifications are not supported in this browser.";
        return;
      }

      if (notificationToggle) notificationToggle.checked = true;
      localStorage.setItem("smartTimetableNotificationEnabled", "true");

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        statusMessage.textContent = "Notifications enabled for priority classes.";
      } else {
        statusMessage.textContent = "Notifications permission was not granted.";
      }
      applySubjectAccessState();
    });
  }

  if (sheetPickerButton) sheetPickerButton.addEventListener("click", () => openActionSheet("section"));
  if (sheetPickerButtonMobile) sheetPickerButtonMobile.addEventListener("click", () => openActionSheet("section"));
  if (priorityPickerButton) priorityPickerButton.addEventListener("click", () => openActionSheet("priority"));
  if (closeActionSheet) closeActionSheet.addEventListener("click", closePickerSheet);
  if (actionSheetBackdrop) {
    actionSheetBackdrop.addEventListener("click", (event) => {
      if (event.target === actionSheetBackdrop) closePickerSheet();
    });
  }
  if (actionSheetOptions) {
    actionSheetOptions.addEventListener("click", (event) => {
      const option = event.target.closest("[data-picker-value]");
      if (option) selectFromActionSheet(option.dataset.pickerValue);
    });
  }

  updateClock();
  setInterval(updateClock, 1000);

  const selfCheck = loadSavedSchedule();
  if (selfCheck) {
    maybeNotifyPrioritySubject(selfCheck);
  }

  applySubjectAccessState();
}

if (typeof window !== "undefined") {
  init();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseMasterSheet,
    getTimeSlotColumns,
    extractSlots,
    parseRange,
    normalizeSubject,
    parseDayName,
    initializeSchedule,
    findNextClassFromSchedule
  };
}