import fs from 'fs';
import path from 'path';
import { query } from './db';
import { StoreNotice, STORE_NOTICES, CURRENT_STUDIO_NOTICE, computeReopenMessage } from './storeHours';

export interface StudioNoticeConfig {
  headline: string;
  message: string;
  updatedAt: string;
  availabilityStatus: string;
  isEmergencyClosed?: boolean;
  emergencyClosedMessage?: string;
}

export interface ScheduleData {
  notices: StoreNotice[];
  studioNotice: StudioNoticeConfig;
}

const RUNTIME_SCHEDULE_FILE = path.join(process.cwd(), 'src/data/runtimeSchedule.json');

const INITIAL_SCHEDULE: ScheduleData = {
  notices: [
    ...STORE_NOTICES,
    {
      id: 'republic-day-2027',
      type: 'holiday',
      title: 'Republic Day',
      dateOrPeriod: 'Jan 26, 2027',
      status: 'Special Hours',
      hours: '11:00 AM – 5:00 PM',
      details: 'Studio open for patriotic plant arrangements and national symbol lotus aquascapes.',
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
  ],
  studioNotice: {
    ...CURRENT_STUDIO_NOTICE,
    isEmergencyClosed: false,
    emergencyClosedMessage: '',
  },
};

let cachedSchedule: ScheduleData | null = null;
let lastDiskRead = 0;

export function loadSchedule(): ScheduleData {
  const now = Date.now();
  if (cachedSchedule && now - lastDiskRead < 5000) {
    return cachedSchedule;
  }

  try {
    if (fs.existsSync(RUNTIME_SCHEDULE_FILE)) {
      const raw = fs.readFileSync(RUNTIME_SCHEDULE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.notices)) {
        cachedSchedule = parsed;
        lastDiskRead = now;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[ScheduleService]: Failed reading runtimeSchedule.json, using defaults.', err);
  }

  cachedSchedule = INITIAL_SCHEDULE;
  persistSchedule(INITIAL_SCHEDULE);
  lastDiskRead = now;
  return INITIAL_SCHEDULE;
}

export function persistSchedule(data: ScheduleData): void {
  try {
    cachedSchedule = data;
    lastDiskRead = Date.now();
    fs.writeFileSync(RUNTIME_SCHEDULE_FILE, JSON.stringify(data, null, 2), 'utf8');

    // Async sync to database site_settings table if available
    query(
      `INSERT INTO public.site_settings (key, value, updated_at)
       VALUES ('studio_schedule', $1::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()`,
      [JSON.stringify(data)]
    ).catch(() => {});
  } catch (err) {
    console.error('[ScheduleService]: Error writing schedule to disk:', err);
  }
}

/**
 * Returns an array of 6 consecutive years starting with current year
 * e.g. [2026, 2027, 2028, 2029, 2030, 2031]
 */
export function get6YearsRange(): number[] {
  const currentYear = new Date().getFullYear();
  const baseYear = Math.max(2026, currentYear);
  return Array.from({ length: 6 }, (_, i) => baseYear + i);
}

export interface DetailedCalendarDay {
  dayNumber: number;
  dateStr: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ...
  isOpen: boolean;
  statusLabel: string;
  isToday: boolean;
  isMonday: boolean;
  isHoliday: boolean;
  holidayTitle?: string;
  holidayStatus?: 'Closed' | 'Special Hours' | 'Open Normal' | 'Studio Notice';
  holidayHours?: string;
  holidayDetails?: string;
}

export function getMonthCalendarForYearAndMonth(year: number, monthIndex: number): {
  monthName: string;
  monthIndex: number;
  year: number;
  totalDays: number;
  firstDayOfWeek: number;
  days: DetailedCalendarDay[];
  availableYears: number[];
} {
  const schedule = loadSchedule();
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 3600000 * 5.5);

  const todayYear = istTime.getFullYear();
  const todayMonth = istTime.getMonth();
  const todayDate = istTime.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const days: DetailedCalendarDay[] = [];

  for (let d = 1; d <= totalDays; d++) {
    const curDate = new Date(year, monthIndex, d);
    const dow = curDate.getDay();
    const isToday = year === todayYear && monthIndex === todayMonth && d === todayDate;
    const isMon = dow === 1;
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Find any matching custom notice/holiday
    const matchingNotice = schedule.notices.find((notice) => {
      // Direct YYYY-MM-DD date match
      if (notice.dateOrPeriod.includes(dateStr)) return true;

      // Month name and day match (e.g., "Nov 1, 2026" or "Oct 31")
      const shortMonth = monthNames[monthIndex].slice(0, 3);
      const fullMonth = monthNames[monthIndex];
      const hasMonth = notice.dateOrPeriod.includes(shortMonth) || notice.dateOrPeriod.includes(fullMonth);
      const hasYear = notice.dateOrPeriod.includes(String(year));
      const hasDay = new RegExp(`\\b${d}\\b`).test(notice.dateOrPeriod);

      if (hasMonth && hasDay && (hasYear || !/\b20\d\d\b/.test(notice.dateOrPeriod))) {
        return true;
      }

      return false;
    });

    let isOpen = !isMon;
    let statusLabel = isToday ? 'Today' : isMon ? 'Closed (Mon Care)' : 'Open';
    let isHoliday = false;
    let holidayTitle: string | undefined;
    let holidayStatus: ('Closed' | 'Special Hours' | 'Open Normal' | 'Studio Notice') | undefined;
    let holidayHours: string | undefined;
    let holidayDetails: string | undefined;

    if (matchingNotice) {
      isHoliday = true;
      holidayTitle = matchingNotice.title;
      holidayStatus = matchingNotice.status;
      holidayHours = matchingNotice.hours;
      holidayDetails = matchingNotice.details;

      if (matchingNotice.status === 'Closed') {
        isOpen = false;
        statusLabel = `Closed (${matchingNotice.title})`;
      } else if (matchingNotice.status === 'Special Hours') {
        isOpen = true;
        statusLabel = `Special (${matchingNotice.title})`;
      }
    }

    days.push({
      dayNumber: d,
      dateStr,
      dayOfWeek: dow,
      isOpen,
      statusLabel,
      isToday,
      isMonday: isMon,
      isHoliday,
      holidayTitle,
      holidayStatus,
      holidayHours,
      holidayDetails,
    });
  }

  return {
    monthName: monthNames[monthIndex],
    monthIndex,
    year,
    totalDays,
    firstDayOfWeek: firstDay,
    days,
    availableYears: get6YearsRange(),
  };
}

export function addNotice(notice: Omit<StoreNotice, 'id'>): StoreNotice {
  const schedule = loadSchedule();
  const id = 'notice-' + Date.now().toString(36);
  const reopenMessage =
    notice.reopenMessage ||
    (notice.status === 'Closed'
      ? computeReopenMessage(notice.endDate || notice.startDate || notice.dateOrPeriod, schedule.notices)
      : undefined);

  const newNotice: StoreNotice = {
    ...notice,
    id,
    reopenMessage,
    badgeClass:
      notice.status === 'Closed'
        ? 'text-rose-800 bg-rose-50 border-rose-200'
        : notice.status === 'Special Hours'
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : 'text-emerald-800 bg-emerald-50 border-emerald-200',
  };

  schedule.notices.unshift(newNotice);
  persistSchedule(schedule);
  return newNotice;
}

export function updateNotice(id: string, updates: Partial<StoreNotice>): StoreNotice | null {
  const schedule = loadSchedule();
  const idx = schedule.notices.findIndex((n) => n.id === id);
  if (idx === -1) return null;

  const current = schedule.notices[idx];
  const targetStatus = updates.status || current.status;
  const targetEnd =
    updates.endDate ||
    current.endDate ||
    updates.startDate ||
    current.startDate ||
    updates.dateOrPeriod ||
    current.dateOrPeriod;

  const reopenMessage =
    updates.reopenMessage ||
    (targetStatus === 'Closed' ? computeReopenMessage(targetEnd, schedule.notices) : undefined);

  const updated: StoreNotice = {
    ...current,
    ...updates,
    reopenMessage,
    badgeClass:
      targetStatus === 'Closed'
        ? 'text-rose-800 bg-rose-50 border-rose-200'
        : targetStatus === 'Special Hours'
        ? 'text-amber-800 bg-amber-50 border-amber-200'
        : 'text-emerald-800 bg-emerald-50 border-emerald-200',
  };

  schedule.notices[idx] = updated;
  persistSchedule(schedule);
  return updated;
}

export function deleteNotice(id: string): boolean {
  const schedule = loadSchedule();
  const initialLen = schedule.notices.length;
  schedule.notices = schedule.notices.filter((n) => n.id !== id);
  if (schedule.notices.length !== initialLen) {
    persistSchedule(schedule);
    return true;
  }
  return false;
}

export function updateStudioBroadcast(updates: Partial<StudioNoticeConfig>): StudioNoticeConfig {
  const schedule = loadSchedule();
  schedule.studioNotice = {
    ...schedule.studioNotice,
    ...updates,
    updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  };
  persistSchedule(schedule);
  return schedule.studioNotice;
}
