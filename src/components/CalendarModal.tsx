'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  getMonthCalendar,
  get6YearsRange,
  MONTH_NAMES,
  CalendarDay,
  StoreNotice,
  STORE_NOTICES,
} from '@/lib/storeHours';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices?: StoreNotice[];
}

export default function CalendarModal({ isOpen, onClose, notices }: CalendarModalProps) {
  const years = get6YearsRange();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedDayInfo, setSelectedDayInfo] = useState<CalendarDay | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedYear(years[0] || currentYear);
      setSelectedMonth(currentMonth);
      setSelectedDayInfo(null);
    }
  }, [isOpen, currentMonth, currentYear, years]);

  // Close on Escape key and lock body scroll cleanly preserving prior overflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const calendarData = getMonthCalendar(selectedYear, selectedMonth, notices);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      const prevYearIndex = years.indexOf(selectedYear) - 1;
      if (prevYearIndex >= 0) {
        setSelectedYear(years[prevYearIndex]);
        setSelectedMonth(11);
      }
    } else {
      setSelectedMonth((m) => m - 1);
    }
    setSelectedDayInfo(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      const nextYearIndex = years.indexOf(selectedYear) + 1;
      if (nextYearIndex < years.length) {
        setSelectedYear(years[nextYearIndex]);
        setSelectedMonth(0);
      }
    } else {
      setSelectedMonth((m) => m + 1);
    }
    setSelectedDayInfo(null);
  };

  const isFirstMonthOfFirstYear = selectedYear === years[0] && selectedMonth === 0;
  const isLastMonthOfLastYear = selectedYear === years[years.length - 1] && selectedMonth === 11;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Studio Sanctuary Calendar & Holidays"
        className="w-full max-w-3xl max-h-[calc(100dvh-32px)] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Modal Header — Follows Screenshot 2 Reference */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="text-xl shrink-0">📅</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display text-lg font-bold text-nature-forest leading-snug">
                  Studio Sanctuary Calendar &amp; Holidays
                </h2>
                <span className="text-3xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full shrink-0">
                  6-Year Schedule
                </span>
              </div>
              <p className="text-2xs text-stone-500 mt-0.5">
                Browse planned operating schedules, Sunday nursery rest, and festival hours from {years[0]} to {years[years.length - 1]}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors shrink-0 cursor-pointer"
            aria-label="Close Calendar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">

        {/* Year and Month Controls */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Year Selector (6 Years) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-semibold text-nature-stone shrink-0">Year:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                {years.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setSelectedYear(yr);
                      setSelectedDayInfo(null);
                    }}
                    className={`px-4 py-2 text-sm rounded-xl font-mono font-bold transition-all cursor-pointer ${
                      selectedYear === yr
                        ? 'bg-nature-forest text-white shadow-xs'
                        : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={isFirstMonthOfFirstYear}
                className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4 text-stone-600" />
              </button>

              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(parseInt(e.target.value, 10));
                  setSelectedDayInfo(null);
                }}
                className="bg-white border border-stone-200 text-sm font-bold text-nature-forest rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-nature-moss cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name} {selectedYear}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={isLastMonthOfLastYear}
                className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4 text-stone-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 mb-6 shadow-2xs">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-nature-forest font-display">
              {calendarData.monthName} {calendarData.year}
            </span>
            <div className="flex items-center gap-3 text-3xs font-medium text-stone-500">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Open
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Closed (Mon / Holiday)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Special
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={i} className="font-bold text-2xs text-stone-400 py-1">
                {d}
              </div>
            ))}

            {/* Leading empty offsets */}
            {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
              <div key={`offset-${i}`} className="py-2" />
            ))}

            {/* Days */}
            {calendarData.days.map((d) => {
              const isSelected = selectedDayInfo?.dateStr === d.dateStr;
              return (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => setSelectedDayInfo(d)}
                  className={`p-2 rounded-xl font-mono text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    d.isToday
                      ? 'bg-nature-forest text-white ring-2 ring-emerald-400 shadow-sm scale-105'
                      : isSelected
                      ? 'ring-2 ring-nature-moss bg-emerald-50 text-nature-forest shadow-xs'
                      : d.isHoliday && d.holidayStatus === 'Closed'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                      : d.isHoliday && d.holidayStatus === 'Special Hours'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      : d.isMonday
                      ? 'bg-stone-100/80 text-stone-500 border border-stone-200/60 hover:bg-stone-200/60'
                      : 'bg-white text-emerald-950 border border-stone-200/70 hover:border-emerald-300 hover:bg-emerald-50/30'
                  }`}
                  title={`${d.dateStr}: ${d.statusLabel}`}
                >
                  <span className="text-xs">{d.dayNumber}</span>
                  <span className="text-3xs font-sans font-normal opacity-80 leading-none mt-0.5">
                    {d.isToday
                      ? 'Today'
                      : d.isHoliday
                      ? 'Holiday'
                      : d.isMonday
                      ? 'Care'
                      : 'Open'}
                  </span>
                  {d.isHoliday && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Popover / Callout */}
        {selectedDayInfo && (
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/80 p-4 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-nature-forest">
                Date Details: {selectedDayInfo.dateStr}
              </span>
              <span
                className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                  selectedDayInfo.isOpen
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {selectedDayInfo.isOpen ? 'Studio Open' : 'Studio Closed'}
              </span>
            </div>
            <p className="text-xs text-nature-stone">
              {selectedDayInfo.holidayDetails ||
                (selectedDayInfo.dayOfWeek === 0
                  ? 'Weekly nursery rest and hydration day reserved for greenhouse plant care and custom aquarium fabrication.'
                  : selectedDayInfo.dayOfWeek === 6
                  ? 'Extended Saturday Studio Hours: 9:00 AM – 9:00 PM.'
                  : 'Regular Studio Hours: 9:00 AM – 8:30 PM. Walk-ins welcome!')}
            </p>
            {selectedDayInfo.reopenMessage && (
              <div className="mt-2 text-2xs font-bold text-emerald-950 bg-emerald-100/90 border border-emerald-300/80 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>{selectedDayInfo.reopenMessage}</span>
              </div>
            )}
            {selectedDayInfo.holidayHours && (
              <p className="text-2xs font-mono font-bold text-nature-forest mt-1">
                Hours: {selectedDayInfo.holidayHours}
              </p>
            )}
          </div>
        )}

        {/* Scheduled Notices / Holidays List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-nature-forest flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-nature-moss" />
              <span>Upcoming Festivals &amp; Planned Special Timings</span>
            </h4>
            <span className="text-3xs text-stone-500 font-mono">
              6-Year Roadmap
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {(notices || STORE_NOTICES).map((notice) => (
              <div
                key={notice.id}
                className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3 text-xs space-y-1 hover:border-stone-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-stone-900 truncate">{notice.title}</span>
                  <span className={`text-3xs font-bold px-2 py-0.5 rounded-full shrink-0 border ${notice.badgeClass}`}>
                    {notice.status}
                  </span>
                </div>
                <p className="text-3xs font-mono text-stone-500">{notice.dateOrPeriod}</p>
                <p className="text-2xs text-stone-600 line-clamp-2 leading-relaxed">{notice.details}</p>
                {notice.reopenMessage && (
                  <p className="text-3xs font-semibold text-emerald-900 bg-emerald-100/80 border border-emerald-200/80 px-2 py-1 rounded-md">
                    🔔 {notice.reopenMessage}
                  </p>
                )}
                {notice.hours && !notice.reopenMessage && (
                  <p className="text-3xs font-mono text-emerald-800 font-semibold">
                    Hours: {notice.hours}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
}
