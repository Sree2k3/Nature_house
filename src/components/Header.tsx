'use client';

import React, { useEffect, useState } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { getStoreStatus, StoreStatus } from '@/lib/storeHours';
import { STORE_INFO } from '@/data/mockCatalog';

export default function Header() {
  const [status, setStatus] = useState<StoreStatus>({
    isOpen: true,
    todayDayName: 'Thursday',
    todayHoursDisplay: '9:00 AM – 8:30 PM',
    tomorrowDayName: 'Friday',
    tomorrowHoursDisplay: '9:00 AM – 8:30 PM',
    primaryMessage: 'Thursday Open: 9:00 AM – 8:30 PM',
    secondaryMessage: 'Tomorrow (Fri): 9:00 AM – 8:30 PM',
    compactBadgeText: 'Thursday Open • 9:00 AM – 8:30 PM',
    badgeClass: 'text-emerald-900 bg-emerald-50/95 border-emerald-300/80',
    weeklySchedule: [],
  });

  useEffect(() => {
    setStatus(getStoreStatus());

    fetch('/api/schedule', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.storeStatus) setStatus(data.storeStatus);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/schedule', { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data?.storeStatus) setStatus(data.storeStatus);
        })
        .catch(() => {
          setStatus(getStoreStatus());
        });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/70 bg-nature-linen/95 backdrop-blur-md shadow-xs">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Brand & Botanical Leaf Emblem */}
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200/60 shadow-xs text-xl">
              🌿
            </div>
            <div>
              <a
                href="/"
                className="font-display text-xl font-bold tracking-tight text-nature-forest sm:text-2xl hover:opacity-90"
              >
                {STORE_INFO.storeName}
              </a>
              <p className="hidden text-xs text-nature-muted sm:block">
                Botanical Sanctuary &amp; Aquascaping Gallery
              </p>
            </div>
          </div>

          {/* Right: Dynamic Day-Based Store Operating Hours Pill */}
          <div className="flex items-center">
            <div
              className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-1.5 shadow-xs transition-all ${status.badgeClass}`}
            >
              {/* Pulsing indicator dot */}
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                {status.isOpen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    status.isOpen ? 'bg-emerald-600' : 'bg-amber-600'
                  }`}
                />
              </span>

              {/* Day-based Schedule Text */}
              <div className="text-left">
                {/* Line 1: Today's Status & Hours (e.g., Thursday Open: 9:00 AM – 8:30 PM) */}
                <div className="flex items-center gap-1.5 text-xs font-bold leading-tight text-nature-forest">
                  <Clock className="h-3.5 w-3.5 text-nature-moss shrink-0 hidden sm:inline" />
                  <span>{status.primaryMessage}</span>
                </div>

                {/* Line 2: Tomorrow's Schedule (e.g., Tomorrow (Fri): 9:00 AM – 8:30 PM) */}
                <div className="hidden sm:flex items-center gap-1 text-2xs text-nature-stone/75 font-medium mt-0.5">
                  <Calendar className="h-3 w-3 text-stone-400 shrink-0" />
                  <span>{status.secondaryMessage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-only secondary day status sub-strip */}
        <div className="flex sm:hidden items-center justify-center border-t border-stone-200/50 bg-white/60 py-1 px-4 text-center">
          <span className="text-2xs text-nature-stone/80 font-medium">
            🗓️ Tomorrow ({status.tomorrowDayName}): {status.tomorrowHoursDisplay}
          </span>
        </div>
      </header>
  );
}
