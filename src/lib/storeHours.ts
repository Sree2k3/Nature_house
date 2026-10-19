/**
 * Dynamic Store Hours & Day-Based Schedule Engine
 * Calculates real-time open/closed status based on Indian Standard Time (IST - UTC+5:30)
 * Provides dynamic day-based strings: Today (e.g. Thursday), operating hours,
 * real-time open status, and tomorrow's upcoming schedule.
 */

export interface DailySchedule {
  dayName: string;
  shortDay: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  isOpenDay: boolean;
  openHour: number; // 24-hr format (e.g. 9 for 09:00)
  openMinute: number;
  closeHour: number; // 24-hr format (e.g. 20 for 20:30)
  closeMinute: number;
  openTimeStr: string;
  closeTimeStr: string;
  hoursDisplay: string;
  note?: string;
}

export const WEEKLY_SCHEDULE: DailySchedule[] = [
  {
    dayName: 'Sunday',
    shortDay: 'Sun',
    dayIndex: 0,
    isOpenDay: false,
    openHour: 0,
    openMinute: 0,
    closeHour: 0,
    closeMinute: 0,
    openTimeStr: '',
    closeTimeStr: '',
    hoursDisplay: 'Closed on Sundays',
    note: 'Weekly nursery rest & greenhouse hydration day',
  },
  {
    dayName: 'Monday',
    shortDay: 'Mon',
    dayIndex: 1,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 20,
    closeMinute: 30,
    openTimeStr: '9:00 AM',
    closeTimeStr: '8:30 PM',
    hoursDisplay: '9:00 AM – 8:30 PM',
  },
  {
    dayName: 'Tuesday',
    shortDay: 'Tue',
    dayIndex: 2,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 20,
    closeMinute: 30,
    openTimeStr: '9:00 AM',
    closeTimeStr: '8:30 PM',
    hoursDisplay: '9:00 AM – 8:30 PM',
  },
  {
    dayName: 'Wednesday',
    shortDay: 'Wed',
    dayIndex: 3,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 20,
    closeMinute: 30,
    openTimeStr: '9:00 AM',
    closeTimeStr: '8:30 PM',
    hoursDisplay: '9:00 AM – 8:30 PM',
  },
  {
    dayName: 'Thursday',
    shortDay: 'Thu',
    dayIndex: 4,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 20,
    closeMinute: 30,
    openTimeStr: '9:00 AM',
    closeTimeStr: '8:30 PM',
    hoursDisplay: '9:00 AM – 8:30 PM',
  },
  {
    dayName: 'Friday',
    shortDay: 'Fri',
    dayIndex: 5,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 20,
    closeMinute: 30,
    openTimeStr: '9:00 AM',
    closeTimeStr: '8:30 PM',
    hoursDisplay: '9:00 AM – 8:30 PM',
  },
  {
    dayName: 'Saturday',
    shortDay: 'Sat',
    dayIndex: 6,
    isOpenDay: true,
    openHour: 9,
    openMinute: 0,
    closeHour: 21,
    closeMinute: 0,
    openTimeStr: '9:00 AM',
    closeTimeStr: '9:00 PM',
    hoursDisplay: '9:00 AM – 9:00 PM',
  },
];

export interface StoreStatus {
  isOpen: boolean;
  todayDayName: string;
  todayHoursDisplay: string;
  tomorrowDayName: string;
  tomorrowHoursDisplay: string;
  primaryMessage: string;
  secondaryMessage: string;
  compactBadgeText: string;
  badgeClass: string;
  weeklySchedule: (DailySchedule & { isToday: boolean; isTomorrow: boolean })[];
}

/**
 * Returns current dynamic day-based store status
 */
export function getStoreStatus(
  customNotices?: StoreNotice[],
  broadcastOverride?: { isEmergencyClosed?: boolean; emergencyClosedMessage?: string }
): StoreStatus {
  // Compute current Indian Standard Time (UTC+5:30)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 3600000 * 5.5);

  const dayOfWeek = istTime.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const tomorrowDayOfWeek = (dayOfWeek + 1) % 7;

  const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();

  const todaySchedule = WEEKLY_SCHEDULE[dayOfWeek];
  const tomorrowSchedule = WEEKLY_SCHEDULE[tomorrowDayOfWeek];

  const enrichedSchedule = WEEKLY_SCHEDULE.map((day) => ({
    ...day,
    isToday: day.dayIndex === dayOfWeek,
    isTomorrow: day.dayIndex === tomorrowDayOfWeek,
  }));

  // Emergency or Manual "Store is Closed" override
  if (broadcastOverride?.isEmergencyClosed) {
    const msg = broadcastOverride.emergencyClosedMessage || 'Studio Temporarily Closed';
    return {
      isOpen: false,
      todayDayName: todaySchedule.dayName,
      todayHoursDisplay: 'Store Closed Today',
      tomorrowDayName: tomorrowSchedule.dayName,
      tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
      primaryMessage: msg,
      secondaryMessage: 'Message us on WhatsApp for orders or inquiries',
      compactBadgeText: msg,
      badgeClass: 'text-rose-900 bg-rose-50/95 border-rose-300',
      weeklySchedule: enrichedSchedule,
    };
  }

  // Check if today matches a scheduled holiday or manual closure
  const notices = customNotices || STORE_NOTICES;
  const todayDateStr = `${istTime.getFullYear()}-${String(istTime.getMonth() + 1).padStart(2, '0')}-${String(istTime.getDate()).padStart(2, '0')}`;
  const shortMonth = MONTH_NAMES[istTime.getMonth()].slice(0, 3);
  const fullMonth = MONTH_NAMES[istTime.getMonth()];
  const todayHoliday = notices.find((n) => {
    // 1. Strict date range check
    if (n.startDate && n.endDate) {
      if (todayDateStr >= n.startDate && todayDateStr <= n.endDate) return true;
    }
    // 2. Single day check
    if (n.startDate && !n.endDate && n.startDate === todayDateStr) return true;
    // 3. Fallback matching
    if (n.dateOrPeriod.includes(todayDateStr)) return true;
    const hasM = n.dateOrPeriod.includes(shortMonth) || n.dateOrPeriod.includes(fullMonth);
    const hasY = n.dateOrPeriod.includes(String(istTime.getFullYear()));
    const hasD = new RegExp(`\\b${istTime.getDate()}\\b`).test(n.dateOrPeriod);
    return hasM && hasD && (hasY || !/\b20\d\d\b/.test(n.dateOrPeriod));
  });

  if (todayHoliday && todayHoliday.status === 'Closed') {
    const reopenMsg =
      todayHoliday.reopenMessage ||
      computeReopenMessage(todayHoliday.endDate || todayHoliday.startDate || todayDateStr, notices);
    return {
      isOpen: false,
      todayDayName: todaySchedule.dayName,
      todayHoursDisplay: todayHoliday.hours || `Closed (${todayHoliday.title})`,
      tomorrowDayName: tomorrowSchedule.dayName,
      tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
      primaryMessage: `${todayHoliday.title}: Store is Closed`,
      secondaryMessage: reopenMsg,
      compactBadgeText: `Closed • ${reopenMsg}`,
      badgeClass: 'text-rose-900 bg-rose-50/95 border-rose-300',
      weeklySchedule: enrichedSchedule,
    };
  }

  // If today is a closed day (e.g. Sunday)
  if (!todaySchedule.isOpenDay) {
    const nextOpenText = tomorrowSchedule.isOpenDay
      ? `Opens Tomorrow (${tomorrowSchedule.dayName}) at ${tomorrowSchedule.openTimeStr}`
      : 'Opens Monday at 9:00 AM';

    return {
      isOpen: false,
      todayDayName: todaySchedule.dayName,
      todayHoursDisplay: 'Closed on Sundays',
      tomorrowDayName: tomorrowSchedule.dayName,
      tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
      primaryMessage: `${todaySchedule.dayName}: Closed Today`,
      secondaryMessage: nextOpenText,
      compactBadgeText: `${todaySchedule.dayName} Closed • ${nextOpenText}`,
      badgeClass: 'text-amber-800 bg-amber-50/90 border-amber-200/80',
      weeklySchedule: enrichedSchedule,
    };
  }

  const openMinutes = todaySchedule.openHour * 60 + todaySchedule.openMinute;
  const closeMinutes = todaySchedule.closeHour * 60 + todaySchedule.closeMinute;

  // Case 1: Store is currently open right now
  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      isOpen: true,
      todayDayName: todaySchedule.dayName,
      todayHoursDisplay: todaySchedule.hoursDisplay,
      tomorrowDayName: tomorrowSchedule.dayName,
      tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
      primaryMessage: `${todaySchedule.dayName} Open: ${todaySchedule.hoursDisplay}`,
      secondaryMessage: `Closes at ${todaySchedule.closeTimeStr} • Tomorrow (${tomorrowSchedule.shortDay}): ${tomorrowSchedule.hoursDisplay}`,
      compactBadgeText: `${todaySchedule.dayName} Open • ${todaySchedule.hoursDisplay}`,
      badgeClass: 'text-emerald-900 bg-emerald-50/95 border-emerald-300/80',
      weeklySchedule: enrichedSchedule,
    };
  }

  // Case 2: Today is an open day, but it's currently morning before opening time
  if (currentMinutes < openMinutes) {
    return {
      isOpen: false,
      todayDayName: todaySchedule.dayName,
      todayHoursDisplay: todaySchedule.hoursDisplay,
      tomorrowDayName: tomorrowSchedule.dayName,
      tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
      primaryMessage: `${todaySchedule.dayName}: Opens today at ${todaySchedule.openTimeStr}`,
      secondaryMessage: `Today's Hours: ${todaySchedule.hoursDisplay}`,
      compactBadgeText: `${todaySchedule.dayName}: Opens at ${todaySchedule.openTimeStr} (${todaySchedule.hoursDisplay})`,
      badgeClass: 'text-stone-700 bg-stone-100/90 border-stone-300/80',
      weeklySchedule: enrichedSchedule,
    };
  }

  // Case 3: Today was an open day, but it's currently night after closing time
  const tomorrowOpenText = tomorrowSchedule.isOpenDay
    ? `Opens Tomorrow (${tomorrowSchedule.dayName}) at ${tomorrowSchedule.openTimeStr}`
    : `Closed Tomorrow (${tomorrowSchedule.dayName}) • Opens Monday at 9:00 AM`;

  return {
    isOpen: false,
    todayDayName: todaySchedule.dayName,
    todayHoursDisplay: todaySchedule.hoursDisplay,
    tomorrowDayName: tomorrowSchedule.dayName,
    tomorrowHoursDisplay: tomorrowSchedule.hoursDisplay,
    primaryMessage: `${todaySchedule.dayName}: Closed for tonight`,
    secondaryMessage: tomorrowOpenText,
    compactBadgeText: `${todaySchedule.dayName} Closed • ${tomorrowOpenText}`,
    badgeClass: 'text-stone-700 bg-stone-100/90 border-stone-300/80',
    weeklySchedule: enrichedSchedule,
  };
}

// ── CALENDAR, HOLIDAYS & SPECIAL NOTICES ────────────────────────────

export interface StoreNotice {
  id: string;
  type: 'holiday' | 'maintenance' | 'festival' | 'broadcast' | 'closure';
  title: string;
  dateOrPeriod: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: 'Closed' | 'Special Hours' | 'Open Normal' | 'Studio Notice';
  hours?: string;
  details: string;
  reopenMessage?: string; // e.g. "The store is closed and will open after this day on Tuesday, Oct 27 at 9:00 AM."
  badgeClass?: string;
}

export const STORE_NOTICES: StoreNotice[] = [
  {
    id: 'sun-care',
    type: 'maintenance',
    title: 'Weekly Sunday Sanctuary Maintenance',
    dateOrPeriod: 'Every Sunday',
    status: 'Closed',
    hours: 'Closed on Sundays',
    details: 'Reserved for deep greenhouse plant hydration, botanical pruning, and bespoke glass aquarium fabrication.',
    badgeClass: 'text-rose-800 bg-rose-50 border-rose-200',
  },
  {
    id: 'durga-puja-2026',
    type: 'festival',
    title: 'Durga Puja (Maha Saptami – Dashami)',
    dateOrPeriod: 'Oct 19 – Oct 23, 2026',
    status: 'Special Hours',
    hours: '10:00 AM – 4:00 PM',
    details: 'Grand festive celebration across West Bengal. Studio open for festive plant gifting and artisanal aquariums.',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    id: 'kali-puja-2026',
    type: 'festival',
    title: 'Kali Puja & Deepavali',
    dateOrPeriod: 'Oct 31 – Nov 1, 2026',
    status: 'Special Hours',
    hours: '10:00 AM – 4:00 PM',
    details: 'Festival of lights. Handcrafted gifting terrariums, auspicious money plants, and mini aquascapes available.',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    id: 'christmas-2026',
    type: 'festival',
    title: 'Christmas Day',
    dateOrPeriod: 'Dec 25, 2026',
    status: 'Open Normal',
    hours: '9:00 AM – 8:30 PM',
    details: 'Full living studio open. Walk-ins welcome for custom aquatic scape design consultations.',
    badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'newyear-2027',
    type: 'holiday',
    title: "New Year's Day Welcome",
    dateOrPeriod: 'Jan 1, 2027',
    status: 'Special Hours',
    hours: '11:00 AM – 8:30 PM',
    details: 'Begin the new year with living greenery. Complementary plant potting guidance for all studio visitors.',
    badgeClass: 'text-sky-800 bg-sky-50 border-sky-200',
  },
  {
    id: 'republic-day-2027',
    type: 'holiday',
    title: 'Republic Day',
    dateOrPeriod: 'Jan 26, 2027',
    status: 'Special Hours',
    hours: '11:00 AM – 5:00 PM',
    details: 'National celebration. Studio open for patriotic lotus and aquatic arrangements.',
    badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'poila-boishakh-2027',
    type: 'festival',
    title: 'Poila Boishakh (Bengali New Year)',
    dateOrPeriod: 'Apr 15, 2027',
    status: 'Special Hours',
    hours: '10:00 AM – 5:00 PM',
    details: 'Subho Noboborsho! Welcoming new beginnings with auspicious foliage, lucky money plants, and tabletop nano aquascapes.',
    badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'independence-day-2027',
    type: 'holiday',
    title: 'Independence Day',
    dateOrPeriod: 'Aug 15, 2027',
    status: 'Closed',
    hours: 'Closed for Walk-ins',
    details: 'National holiday observance. Digital botanical consultation available online.',
    badgeClass: 'text-rose-800 bg-rose-50 border-rose-200',
  },
  {
    id: 'gandhi-jayanti-2027',
    type: 'holiday',
    title: 'Mahatma Gandhi Jayanti',
    dateOrPeriod: 'Oct 2, 2027',
    status: 'Closed',
    hours: 'Closed for Walk-ins',
    details: 'National holiday observance in honor of the Father of the Nation.',
    badgeClass: 'text-rose-800 bg-rose-50 border-rose-200',
  },
];

export const CURRENT_STUDIO_NOTICE = {
  headline: 'Studio Availability & Live Broadcast',
  message:
    'Full botanical studio & aquascaping showroom are open Monday to Saturday (9:00 AM – 8:30 PM). Walk-ins welcome without prior booking. Sundays are dedicated to weekly nursery rest and tank assembly.',
  updatedAt: 'October 2026',
  availabilityStatus: 'Open for Walk-ins & Consultations',
};

export interface CalendarDay {
  dayNumber: number;
  dateStr: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  isOpen: boolean;
  statusLabel: string;
  isToday: boolean;
  isMonday?: boolean;
  isHoliday?: boolean;
  holidayTitle?: string;
  holidayStatus?: 'Closed' | 'Special Hours' | 'Open Normal' | 'Studio Notice';
  holidayHours?: string;
  holidayDetails?: string;
  reopenMessage?: string;
}

/**
 * Automatically computes a 6-year range starting from current base year (2026..2031)
 */
export function get6YearsRange(): number[] {
  const currentYear = new Date().getFullYear();
  const baseYear = Math.max(2026, currentYear);
  return Array.from({ length: 6 }, (_, i) => baseYear + i);
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Computes the first valid opening day/time strictly AFTER a given end date or closed day.
 * Skips Mondays (weekly maintenance) and any days covered by active 'Closed' notices.
 */
export function computeReopenMessage(endDateStr: string, customNotices?: StoreNotice[]): string {
  const notices = customNotices || STORE_NOTICES;

  let targetDate: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
    const [y, m, d] = endDateStr.split('-').map(Number);
    targetDate = new Date(y, m - 1, d);
  } else {
    targetDate = new Date(endDateStr);
    if (isNaN(targetDate.getTime())) {
      targetDate = new Date();
    }
  }

  // Look ahead up to 14 days to find the next open day
  for (let i = 1; i <= 14; i++) {
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + i);

    const dow = nextDate.getDay();
    // Sunday is weekly nursery rest & maintenance
    if (dow === 0) continue;

    const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
    const nextDayShortMonth = MONTH_NAMES[nextDate.getMonth()].slice(0, 3);
    const nextDayNum = nextDate.getDate();

    // Check if covered by another closed notice
    const isClosedNotice = notices.some((n) => {
      if (n.status !== 'Closed') return false;
      if (n.startDate && n.endDate) {
        return nextDateStr >= n.startDate && nextDateStr <= n.endDate;
      }
      if (n.startDate) {
        return nextDateStr === n.startDate;
      }
      if (n.dateOrPeriod.includes(nextDateStr)) return true;
      const hasM = n.dateOrPeriod.includes(nextDayShortMonth);
      const hasD = new RegExp(`\\b${nextDayNum}\\b`).test(n.dateOrPeriod);
      const hasY = n.dateOrPeriod.includes(String(nextDate.getFullYear()));
      return hasM && hasD && (hasY || !/\b20\d\d\b/.test(n.dateOrPeriod));
    });

    if (isClosedNotice) continue;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const reopenDayName = dayNames[dow];
    const reopenMonthName = MONTH_NAMES[nextDate.getMonth()].slice(0, 3);

    return `The store is closed and will open after this day on ${reopenDayName}, ${reopenMonthName} ${nextDate.getDate()} at 9:00 AM.`;
  }

  return 'The store is closed and will open after this day on Monday at 9:00 AM.';
}

/**
 * Returns month calendar for ANY given year and month across the 6-year window
 */
export function getMonthCalendar(
  year?: number,
  monthIndex?: number,
  customNotices?: StoreNotice[]
): {
  monthName: string;
  monthIndex: number;
  year: number;
  totalDays: number;
  firstDayOfWeek: number; // 0 = Sun
  days: CalendarDay[];
  availableYears: number[];
} {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 3600000 * 5.5);

  const targetYear = typeof year === 'number' ? year : istTime.getFullYear();
  const targetMonth = typeof monthIndex === 'number' ? monthIndex : istTime.getMonth();
  const todayDate = istTime.getDate();
  const isTargetMonthCurrent = targetYear === istTime.getFullYear() && targetMonth === istTime.getMonth();

  const firstDay = new Date(targetYear, targetMonth, 1).getDay();
  const totalDays = new Date(targetYear, targetMonth + 1, 0).getDate();
  const notices = customNotices || STORE_NOTICES;

  const days: CalendarDay[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(targetYear, targetMonth, d);
    const dow = curDate.getDay();
    const isToday = isTargetMonthCurrent && d === todayDate;
    const isSun = dow === 0;
    const dateStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Match against active notices/holidays (support single day & date ranges)
    const matchingNotice = notices.find((n) => {
      if (n.startDate && n.endDate) {
        if (dateStr >= n.startDate && dateStr <= n.endDate) return true;
      }
      if (n.startDate && !n.endDate && n.startDate === dateStr) return true;
      if (n.dateOrPeriod.includes(dateStr)) return true;
      const shortM = MONTH_NAMES[targetMonth].slice(0, 3);
      const fullM = MONTH_NAMES[targetMonth];
      const hasM = n.dateOrPeriod.includes(shortM) || n.dateOrPeriod.includes(fullM);
      const hasY = n.dateOrPeriod.includes(String(targetYear));
      const hasD = new RegExp(`\\b${d}\\b`).test(n.dateOrPeriod);
      return hasM && hasD && (hasY || !/\b20\d\d\b/.test(n.dateOrPeriod));
    });

    let isOpen = !isSun;
    let statusLabel = isToday ? 'Today' : isSun ? 'Closed (Sun)' : 'Open';
    let isHoliday = false;
    let reopenMsg: string | undefined;

    if (matchingNotice) {
      isHoliday = true;
      if (matchingNotice.status === 'Closed') {
        isOpen = false;
        statusLabel = `Closed: ${matchingNotice.title}`;
        reopenMsg =
          matchingNotice.reopenMessage ||
          computeReopenMessage(matchingNotice.endDate || matchingNotice.startDate || dateStr, notices);
      } else if (matchingNotice.status === 'Special Hours') {
        isOpen = true;
        statusLabel = `Special: ${matchingNotice.title}`;
      } else {
        statusLabel = matchingNotice.title;
      }
    } else if (isSun) {
      reopenMsg = computeReopenMessage(dateStr, notices);
    }

    days.push({
      dayNumber: d,
      dateStr,
      dayOfWeek: dow,
      isOpen,
      statusLabel,
      isToday,
      isMonday: isSun,
      isHoliday,
      holidayTitle: matchingNotice?.title,
      holidayStatus: matchingNotice?.status,
      holidayHours: matchingNotice?.hours,
      holidayDetails: matchingNotice?.details,
      reopenMessage: reopenMsg,
    });
  }

  return {
    monthName: MONTH_NAMES[targetMonth],
    monthIndex: targetMonth,
    year: targetYear,
    totalDays,
    firstDayOfWeek: firstDay,
    days,
    availableYears: get6YearsRange(),
  };
}

export function getCurrentMonthCalendar(): {
  monthName: string;
  year: number;
  totalDays: number;
  firstDayOfWeek: number; // 0 = Sun
  days: CalendarDay[];
} {
  return getMonthCalendar();
}

