'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  CalendarRange,
} from 'lucide-react';
import {
  getMonthCalendar,
  get6YearsRange,
  MONTH_NAMES,
  CalendarDay,
  StoreNotice,
  STORE_NOTICES,
  CURRENT_STUDIO_NOTICE,
  computeReopenMessage,
} from '@/lib/storeHours';
import { StudioNoticeConfig } from '@/lib/scheduleService';

interface CalendarManagerProps {
  onShowToast: (msg: string) => void;
}

export default function CalendarManager({ onShowToast }: CalendarManagerProps) {
  const years = get6YearsRange();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [notices, setNotices] = useState<StoreNotice[]>(STORE_NOTICES);
  const [studioNotice, setStudioNotice] = useState<StudioNoticeConfig>({
    ...CURRENT_STUDIO_NOTICE,
    isEmergencyClosed: false,
    emergencyClosedMessage: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<StoreNotice | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State for Holiday / Closure
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single');
  const [formTitle, setFormTitle] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Closed' | 'Special Hours' | 'Open Normal' | 'Studio Notice'>('Closed');
  const [formHours, setFormHours] = useState('Closed for Walk-ins');
  const [formDetails, setFormDetails] = useState('');
  const [formType, setFormType] = useState<'holiday' | 'maintenance' | 'festival' | 'closure'>('closure');
  const [formReopenMessage, setFormReopenMessage] = useState('');

  // Emergency Broadcast Form State
  const [isEditingBroadcast, setIsEditingBroadcast] = useState(false);
  const [emergencyClosed, setEmergencyClosed] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [broadcastHeadline, setBroadcastHeadline] = useState(CURRENT_STUDIO_NOTICE.headline);
  const [broadcastMessage, setBroadcastMessage] = useState(CURRENT_STUDIO_NOTICE.message);
  const [broadcastAvailability, setBroadcastAvailability] = useState(CURRENT_STUDIO_NOTICE.availabilityStatus);

  // Fetch Live Schedule
  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/schedule', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.notices)) setNotices(data.notices);
        if (data.studioNotice) {
          setStudioNotice(data.studioNotice);
          setEmergencyClosed(Boolean(data.studioNotice.isEmergencyClosed));
          setEmergencyMessage(data.studioNotice.emergencyClosedMessage || '');
          setBroadcastHeadline(data.studioNotice.headline || CURRENT_STUDIO_NOTICE.headline);
          setBroadcastMessage(data.studioNotice.message || CURRENT_STUDIO_NOTICE.message);
          setBroadcastAvailability(data.studioNotice.availabilityStatus || CURRENT_STUDIO_NOTICE.availabilityStatus);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Auto compute reopening message whenever start/end date or status changes
  useEffect(() => {
    if (formStatus === 'Closed') {
      const targetEnd = selectionMode === 'range' ? formEndDate || formStartDate : formStartDate;
      if (targetEnd) {
        const computed = computeReopenMessage(targetEnd, notices);
        setFormReopenMessage(computed);
      }
    } else {
      setFormReopenMessage('');
    }
  }, [formStartDate, formEndDate, selectionMode, formStatus, notices]);

  // Close notice modal on Escape key and lock body scroll (matching ItemDetailModal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsNoticeModalOpen(false);
    };

    if (isNoticeModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isNoticeModalOpen]);

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
  };

  // Open Add/Edit Modal
  const handleOpenAddNotice = (initialDate?: string) => {
    const todayStr = initialDate || new Date().toISOString().split('T')[0];
    setEditingNotice(null);
    setSelectionMode('single');
    setFormTitle('');
    setFormStartDate(todayStr);
    setFormEndDate(todayStr);
    setFormStatus('Closed');
    setFormHours('Closed for Walk-ins');
    setFormDetails('');
    setFormType('closure');
    setFormReopenMessage(computeReopenMessage(todayStr, notices));
    setIsNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (notice: StoreNotice) => {
    const isRange = Boolean(notice.startDate && notice.endDate && notice.startDate !== notice.endDate);
    setEditingNotice(notice);
    setSelectionMode(isRange ? 'range' : 'single');
    setFormTitle(notice.title);
    setFormStartDate(notice.startDate || notice.dateOrPeriod.split(' to ')[0] || '');
    setFormEndDate(
      notice.endDate ||
      notice.dateOrPeriod.split(' to ')[1] ||
      notice.startDate ||
      notice.dateOrPeriod
    );
    setFormStatus(notice.status);
    setFormHours(notice.hours || (notice.status === 'Closed' ? 'Closed for Walk-ins' : '10:00 AM – 4:00 PM'));
    setFormDetails(notice.details);
    setFormType((notice.type as any) || 'holiday');
    setFormReopenMessage(
      notice.reopenMessage ||
      computeReopenMessage(notice.endDate || notice.startDate || notice.dateOrPeriod, notices)
    );
    setIsNoticeModalOpen(true);
  };

  // Save Notice
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveStart = formStartDate.trim();
    const effectiveEnd = selectionMode === 'range' ? formEndDate.trim() || effectiveStart : effectiveStart;

    if (!formTitle.trim() || !effectiveStart) {
      alert('Please provide a title and date.');
      return;
    }

    if (selectionMode === 'range' && effectiveEnd < effectiveStart) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    const effectivePeriod =
      selectionMode === 'range' && effectiveStart !== effectiveEnd
        ? `${effectiveStart} to ${effectiveEnd}`
        : effectiveStart;

    setIsLoading(true);
    try {
      const payload = editingNotice
        ? {
            action: 'update_notice',
            id: editingNotice.id,
            title: formTitle.trim(),
            dateOrPeriod: effectivePeriod,
            startDate: effectiveStart,
            endDate: effectiveEnd,
            status: formStatus,
            hours: formHours.trim(),
            details: formDetails.trim() || `${formTitle.trim()} closure notice.`,
            type: formType,
            reopenMessage: formStatus === 'Closed' ? formReopenMessage : undefined,
          }
        : {
            action: 'add_notice',
            title: formTitle.trim(),
            dateOrPeriod: effectivePeriod,
            startDate: effectiveStart,
            endDate: effectiveEnd,
            status: formStatus,
            hours: formHours.trim(),
            details: formDetails.trim() || `${formTitle.trim()} closure notice.`,
            type: formType,
            reopenMessage: formStatus === 'Closed' ? formReopenMessage : undefined,
          };

      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchSchedule();
        setIsNoticeModalOpen(false);
        onShowToast(editingNotice ? 'Holiday / closure updated' : 'New holiday / closure added');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save notice');
      }
    } catch {
      alert('Network error saving notice');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_notice', id }),
      });

      if (res.ok) {
        await fetchSchedule();
        onShowToast(`Removed "${title}" from schedule`);
      }
    } catch {
      alert('Failed to delete notice');
    }
  };

  // Save Studio Broadcast / Emergency Closed
  const handleSaveBroadcast = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_broadcast',
          headline: broadcastHeadline,
          message: broadcastMessage,
          availabilityStatus: broadcastAvailability,
          isEmergencyClosed: emergencyClosed,
          emergencyClosedMessage: emergencyMessage,
        }),
      });

      if (res.ok) {
        await fetchSchedule();
        setIsEditingBroadcast(false);
        onShowToast('Studio broadcast notice synchronized live');
      } else {
        alert('Failed to update broadcast');
      }
    } catch {
      alert('Error saving broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      {/* 1. Live Studio Broadcast Notice & Emergency Closed Override */}
      <div
        className={`rounded-2xl border p-5 shadow-xs transition-colors ${
          emergencyClosed
            ? 'bg-rose-50/90 border-rose-300'
            : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-stone-50 border-emerald-200/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  emergencyClosed ? 'bg-rose-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  emergencyClosed ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              />
            </span>
            <h3 className="font-display text-base font-bold text-nature-forest">
              {studioNotice.headline}
            </h3>
            {emergencyClosed && (
              <span className="text-3xs font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                EMERGENCY CLOSED OVERRIDE ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingBroadcast(!isEditingBroadcast)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-2xs font-bold text-nature-forest bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-all cursor-pointer shadow-2xs"
            >
              <Edit2 className="h-3 w-3 text-nature-moss" />
              <span>{isEditingBroadcast ? 'Cancel' : 'Edit Notice & Override'}</span>
            </button>
          </div>
        </div>

        {isEditingBroadcast ? (
          <div className="bg-white rounded-xl p-4 border border-stone-200/80 space-y-3 mt-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/70 border border-rose-200">
              <input
                type="checkbox"
                id="emergencyClosed"
                checked={emergencyClosed}
                onChange={(e) => setEmergencyClosed(e.target.checked)}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="emergencyClosed" className="text-xs font-bold text-rose-900 cursor-pointer">
                Manually Set &ldquo;Store is Closed Today&rdquo; Override (Immediately closes site header status)
              </label>
            </div>

            {emergencyClosed && (
              <div>
                <label className="block text-2xs font-bold text-stone-700 mb-1">
                  Custom &ldquo;Store is Closed&rdquo; Reason / Headline
                </label>
                <input
                  type="text"
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  placeholder="e.g. Studio Closed Today for Deep Sanitation & Tank Fabrication"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
                />
              </div>
            )}

            <div>
              <label className="block text-2xs font-bold text-stone-700 mb-1">
                Announcement Headline
              </label>
              <input
                type="text"
                value={broadcastHeadline}
                onChange={(e) => setBroadcastHeadline(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold text-stone-700 mb-1">
                Announcement Message
              </label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingBroadcast(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBroadcast}
                disabled={isLoading}
                className="px-4 py-1.5 text-xs font-bold text-white bg-nature-forest hover:bg-nature-forest/90 rounded-lg cursor-pointer shadow-xs"
              >
                Save &amp; Broadcast Live
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {emergencyClosed
                ? emergencyMessage || 'Studio temporarily closed today. Normal hours resume tomorrow.'
                : studioNotice.message}
            </p>
            <div className="mt-3 flex items-center justify-between text-3xs text-stone-500 pt-2 border-t border-stone-200/60">
              <span>Public notice synchronized across Header &amp; Footer</span>
              <span>Last updated: {studioNotice.updatedAt}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. 6-Year Interactive Calendar & Holiday Controls */}
      <div className="bg-stone-50/80 border border-stone-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-nature-forest" />
            <div>
              <h4 className="font-display text-base font-bold text-nature-forest leading-tight">
                Automatic 6-Year Sanctuary Schedule ({years[0]} – {years[years.length - 1]})
              </h4>
              <p className="text-2xs text-stone-500">
                Click any date to quickly set a single day or range of days closure with automatic reopening announcement.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddNotice()}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-nature-forest hover:bg-emerald-950 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>+ Set Holiday / Range Closure</span>
          </button>
        </div>

        {/* 6-Year Range (2026–2030+) & All 12 Months Quick Auto-Selector Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs mb-6 space-y-4">
          {/* Row 1: Year Selector Buttons (2026 to 2030+) & Auto-Select Current Date Button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-nature-forest" />
                <span>Select Year (2026 – 2030+):</span>
              </span>
              {years.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`px-4 py-2 text-sm rounded-xl font-mono font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-nature-forest text-white shadow-xs ring-2 ring-emerald-400'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Quick Auto-Select Current Month/Year Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedYear(currentYear);
                setSelectedMonth(currentMonth);
                onShowToast(`Auto-selected current calendar: ${MONTH_NAMES[currentMonth]} ${currentYear}`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300/80 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap self-start md:self-auto"
              title="Jump directly to current real-time month"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
              <span>Auto-Select Current Month ({MONTH_NAMES[currentMonth].slice(0, 3)} {currentYear})</span>
            </button>
          </div>

          {/* Row 2: All 12 Months Quick-Select Buttons (Jan – Dec) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-nature-forest" />
                <span>Every Month in {selectedYear} (Click to Auto-Select):</span>
              </span>

              {/* Prev / Next Month Shortcuts */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors cursor-pointer text-xs flex items-center gap-1 text-stone-600 font-semibold"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors cursor-pointer text-xs flex items-center gap-1 text-stone-600 font-semibold"
                  title="Next Month"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 12-Month Grid Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {MONTH_NAMES.map((name, idx) => {
                const isSelected = selectedMonth === idx;
                const isCurrent = currentYear === selectedYear && currentMonth === idx;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedMonth(idx)}
                    className={`px-2.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center relative ${
                      isSelected
                        ? 'bg-nature-forest text-white shadow-xs ring-2 ring-emerald-400'
                        : isCurrent
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-stone-50 text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{name.slice(0, 3)}</span>
                    {isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grid: Calendar View on Left & Scheduled Holidays on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Month Grid */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-nature-forest font-display">
                {calendarData.monthName} {calendarData.year}
              </span>
              <div className="flex items-center gap-3 text-3xs font-medium text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Open
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-stone-300" /> Monday Care
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Closed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div key={i} className="font-bold text-2xs text-stone-400 py-1">
                  {d}
                </div>
              ))}

              {Array.from({ length: calendarData.firstDayOfWeek }).map((_, i) => (
                <div key={`offset-${i}`} className="py-2" />
              ))}

              {calendarData.days.map((d) => (
                <button
                  key={d.dayNumber}
                  type="button"
                  onClick={() => handleOpenAddNotice(d.dateStr)}
                  className={`p-2 rounded-xl font-mono text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                    d.isToday
                      ? 'bg-nature-forest text-white ring-2 ring-emerald-400 shadow-md scale-105'
                      : d.isHoliday && d.holidayStatus === 'Closed'
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                      : d.isHoliday && d.holidayStatus === 'Special Hours'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                      : d.isMonday
                      ? 'bg-stone-100/70 text-stone-500 border border-stone-200/50 hover:bg-stone-200/60'
                      : 'bg-white text-emerald-950 border border-stone-200/70 hover:border-emerald-400 hover:bg-emerald-50/20'
                  }`}
                  title={`${d.dateStr}: ${d.statusLabel}${
                    d.reopenMessage ? ` • ${d.reopenMessage}` : ''
                  }`}
                >
                  <span className="text-xs">{d.dayNumber}</span>
                  <span className="text-3xs font-sans font-normal opacity-75 mt-0.5 leading-none">
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
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-3xs text-stone-500 flex justify-between">
              <span>Standard Hours: 9:00 AM – 8:30 PM</span>
              <span>Saturdays: 9:00 AM – 9:00 PM</span>
            </div>
          </div>

          {/* Right Column: Scheduled Holidays & Custom Closures List */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-700" />
                  <h4 className="font-display text-sm font-bold text-nature-forest">
                    Scheduled Holidays &amp; Store Closures
                  </h4>
                </div>
                <span className="text-3xs font-mono bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-full font-bold">
                  {notices.length} Configured
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => handleOpenEditNotice(notice)}
                    className="group rounded-2xl border border-stone-200/90 p-3.5 bg-stone-50/70 hover:bg-white hover:border-emerald-500/60 hover:shadow-md transition-all flex items-start justify-between gap-3 text-xs cursor-pointer"
                    title="Click to enlarge and manage this schedule card"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 group-hover:text-nature-forest transition-colors">
                          {notice.title}
                        </span>
                        <span className="text-3xs font-mono text-stone-500">
                          ({notice.dateOrPeriod})
                        </span>
                      </div>
                      <p className="text-2xs text-stone-600 leading-relaxed">
                        {notice.details}
                      </p>

                      {notice.reopenMessage && (
                        <p className="text-3xs text-emerald-900 bg-emerald-50/90 border border-emerald-200/70 px-2 py-1 rounded-md font-semibold mt-1">
                          🔔 {notice.reopenMessage}
                        </p>
                      )}

                      {notice.hours && !notice.reopenMessage && (
                        <p className="text-3xs font-mono font-semibold text-emerald-800">
                          Hours: {notice.hours}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${notice.badgeClass}`}>
                        {notice.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditNotice(notice);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-nature-forest hover:bg-stone-200/80 transition-colors cursor-pointer"
                          title="Edit Holiday"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotice(notice.id, notice.title);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Holiday"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-3xs text-stone-500 flex justify-between items-center">
              <span>All updates reflect live across Public Showcase</span>
              <button
                type="button"
                onClick={fetchSchedule}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                Sync All Changes &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Schedule Card Modal — Portaled to document.body to escape any parent stacking contexts */}
      {mounted && isNoticeModalOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setIsNoticeModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[calc(100dvh-32px)] rounded-3xl bg-white shadow-2xl border border-stone-200 flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header — 100% Match to Screenshot 2 (Plant Modal Reference) */}
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-50/70 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <span className="text-xl shrink-0">📅</span>
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2 className="font-display text-lg font-bold text-nature-forest leading-snug">
                    {editingNotice ? `Edit Schedule: ${editingNotice.title}` : 'Set Holiday / Store Closure'}
                  </h2>
                  <span className="text-3xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full shrink-0">
                    {selectionMode === 'range' ? 'Date Range' : 'Single Day'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors shrink-0 cursor-pointer"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="calendar-notice-form" onSubmit={handleSaveNotice} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
                {/* Single Day vs Date Range Toggle */}
                <div>
                  <label className="block text-2xs font-bold text-stone-700 mb-1.5">
                    Selection Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectionMode('single')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectionMode === 'single'
                          ? 'bg-white text-nature-forest shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <CalendarIcon className="h-3.5 w-3.5 text-nature-moss" />
                      <span>Single Day</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionMode('range');
                        if (!formEndDate) setFormEndDate(formStartDate);
                      }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        selectionMode === 'range'
                          ? 'bg-white text-nature-forest shadow-xs font-bold'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <CalendarRange className="h-3.5 w-3.5 text-nature-moss" />
                      <span>Range of Days</span>
                    </button>
                  </div>
                </div>

                {/* Quick Auto-Select Date Presets */}
                <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5">
                  <span className="block text-3xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" />
                    <span>Quick Auto-Select Dates:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date().toISOString().split('T')[0];
                        setFormStartDate(d);
                        setFormEndDate(d);
                        setSelectionMode('single');
                      }}
                      className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-2xs"
                    >
                      Auto-Select Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        const str = d.toISOString().split('T')[0];
                        setFormStartDate(str);
                        setFormEndDate(str);
                        setSelectionMode('single');
                      }}
                      className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-2xs"
                    >
                      Auto-Select Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = new Date();
                        const day = start.getDay();
                        const satOffset = (6 - day + 7) % 7 || 7;
                        const sat = new Date(start);
                        sat.setDate(start.getDate() + satOffset);
                        const sun = new Date(sat);
                        sun.setDate(sat.getDate() + 1);
                        setFormStartDate(sat.toISOString().split('T')[0]);
                        setFormEndDate(sun.toISOString().split('T')[0]);
                        setSelectionMode('range');
                      }}
                      className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-2xs"
                    >
                      Auto-Select Weekend (Sat–Sun)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = new Date().toISOString().split('T')[0];
                        const end = new Date();
                        end.setDate(end.getDate() + 3);
                        setFormStartDate(start);
                        setFormEndDate(end.toISOString().split('T')[0]);
                        setSelectionMode('range');
                      }}
                      className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-2xs"
                    >
                      Auto-Select 3-Day Range
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const start = new Date().toISOString().split('T')[0];
                        const end = new Date();
                        end.setDate(end.getDate() + 7);
                        setFormStartDate(start);
                        setFormEndDate(end.toISOString().split('T')[0]);
                        setSelectionMode('range');
                      }}
                      className="px-2.5 py-1 text-2xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100 cursor-pointer shadow-2xs"
                    >
                      Auto-Select 7-Day Range
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-stone-700 mb-1">
                    Holiday / Closure Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Deep Cleaning / Annual Stock Audit / Deepavali / Maintenance"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
                  />
                </div>

                {/* Date Inputs based on Mode */}
                {selectionMode === 'single' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold text-stone-700 mb-1">
                        Closure Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formStartDate}
                        onChange={(e) => {
                          setFormStartDate(e.target.value);
                          setFormEndDate(e.target.value);
                        }}
                        className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-stone-700 mb-1">
                        Store Status
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setFormStatus(val);
                          if (val === 'Closed') setFormHours('Closed for Walk-ins');
                          else if (val === 'Special Hours') setFormHours('10:00 AM – 4:00 PM');
                        }}
                        className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
                      >
                        <option value="Closed">Closed (Store is Closed)</option>
                        <option value="Special Hours">Special Hours (Custom Timings)</option>
                        <option value="Open Normal">Open Normal (Holiday Event)</option>
                        <option value="Studio Notice">Studio Notice (Informational)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-2xs font-bold text-stone-700 mb-1">
                          Start Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-2xs font-bold text-stone-700 mb-1">
                          End Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          min={formStartDate}
                          className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-2xs font-bold text-stone-700 mb-1">
                        Store Status for this Range
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setFormStatus(val);
                          if (val === 'Closed') setFormHours('Closed for Walk-ins');
                          else if (val === 'Special Hours') setFormHours('10:00 AM – 4:00 PM');
                        }}
                        className="w-full text-xs p-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss"
                      >
                        <option value="Closed">Closed (Store is Closed for all days in range)</option>
                        <option value="Special Hours">Special Hours (Extended/Festival Hours)</option>
                        <option value="Open Normal">Open Normal (Celebration Period)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Automatic Reopening Announcement Preview */}
                {formStatus === 'Closed' && (
                  <div className="rounded-xl bg-emerald-50/90 border border-emerald-300/80 p-3 space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-1.5 text-2xs font-bold text-nature-forest">
                      <Clock className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Automatic Reopening Announcement:</span>
                    </div>
                    <input
                      type="text"
                      value={formReopenMessage}
                      onChange={(e) => setFormReopenMessage(e.target.value)}
                      className="w-full text-xs font-semibold text-emerald-950 bg-white border border-emerald-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="The store is closed and will open after this day on [Day, Date at Time]."
                    />
                    <p className="text-3xs text-stone-500 leading-tight">
                      This message will automatically show across the Header pill and calendar while the store is closed.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-2xs font-bold text-stone-700 mb-1">
                    Operating Hours Label
                  </label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="e.g. Closed for Walk-ins, or 10:00 AM – 4:00 PM"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss font-mono"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-stone-700 mb-1">
                    Closure Reason / Public Explanation
                  </label>
                  <textarea
                    rows={2}
                    value={formDetails}
                    onChange={(e) => setFormDetails(e.target.value)}
                    placeholder="e.g. Studio walk-ins closed for scheduled botanical repotting and aquarium assembly. Digital WhatsApp consultations remain active."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-1 focus:ring-nature-moss leading-relaxed"
                  />
                </div>
              </form>

              {/* Pinned Modal Footer */}
              <div className="flex items-center justify-between border-t border-stone-200 px-6 py-4 bg-stone-50/70 shrink-0">
                {editingNotice ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteNotice(editingNotice.id, editingNotice.title);
                      setIsNoticeModalOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100/80 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Schedule</span>
                  </button>
                ) : (
                  <span className="text-2xs text-stone-400">All dates sync live to public site</span>
                )}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsNoticeModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-100 transition-all shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="calendar-notice-form"
                    disabled={isLoading}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-nature-forest hover:bg-emerald-950 rounded-xl cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isLoading
                        ? 'Saving...'
                        : editingNotice
                        ? 'Update Schedule Card'
                        : selectionMode === 'range'
                        ? 'Save Date Range Closure'
                        : 'Save Single Day Closure'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
