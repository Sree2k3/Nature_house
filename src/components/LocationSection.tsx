'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Phone, MessageCircle, ShieldCheck, Calendar, Bell, Sparkles } from 'lucide-react';
import { STORE_INFO } from '@/data/mockCatalog';
import { buildWhatsAppGeneralUrl } from '@/lib/whatsapp';
import {
  getStoreStatus,
  StoreStatus,
  getCurrentMonthCalendar,
  STORE_NOTICES,
  CURRENT_STUDIO_NOTICE,
} from '@/lib/storeHours';

export default function LocationSection() {
  const whatsappUrl = buildWhatsAppGeneralUrl(STORE_INFO.whatsappPhone);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'timings' | 'calendar'>('timings');
  const monthCalendar = getCurrentMonthCalendar();

  useEffect(() => {
    setStoreStatus(getStoreStatus());
    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="location" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-nature-border/60 bg-stone-100/50">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-nature-sage mb-2">
            Visit Our Sanctuary
          </p>
          <h2 className="section-heading text-3xl sm:text-4xl text-nature-forest">
            Experience Nature House in Person
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-nature-muted">
            Walk among lush indoor greenery, select custom-potted specimens, or discuss bespoke rimless aquascape dimensions directly with our craftsmen.
          </p>
        </div>

        {/* Location Details Grid: 3 Balanced Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 1. Studio Address Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-nature-leaf text-nature-moss shadow-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-nature-forest mb-2">
                Physical Nursery &amp; Studio
              </h3>
              <p className="text-sm text-nature-stone leading-relaxed mb-4">
                {STORE_INFO.addressLine1}<br />
                {STORE_INFO.addressLine2}<br />
                {STORE_INFO.city}, Karnataka — {STORE_INFO.pincode}
              </p>
              <p className="text-xs text-nature-muted flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                Dedicated customer parking available on premises
              </p>
            </div>

            <div className="pt-6">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full shadow-soft"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Turn-by-Turn Directions</span>
              </a>
            </div>
          </div>

          {/* 2. Operating Hours & Calendar Availability Tabbed Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              {/* Header with Status Pill and Tab Switcher */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 shadow-2xs">
                    {activeTab === 'timings' ? <Clock className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-nature-forest leading-tight">
                      {activeTab === 'timings' ? 'Store Hours & Timings' : 'Calendar & Holidays'}
                    </h3>
                  </div>
                </div>

                {storeStatus && (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-3xs font-bold border ${storeStatus.badgeClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${storeStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                    {storeStatus.isOpen ? 'Open Now' : 'Closed Now'}
                  </span>
                )}
              </div>

              {/* Sub-Tabs: Timings vs Calendar */}
              <div className="flex items-center p-1 bg-stone-200/70 rounded-xl mb-3.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('timings')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'timings'
                      ? 'bg-white text-nature-forest shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Timings</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'calendar'
                      ? 'bg-white text-nature-forest shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Calendar &amp; Notices</span>
                </button>
              </div>

              {/* TAB 1: CONSOLIDATED TIMINGS */}
              {activeTab === 'timings' && (
                <div className="animate-fade-in">
                  {/* Dynamic Today & Tomorrow Highlight Strip */}
                  {storeStatus && (
                    <div className="mb-3.5 rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/60 shadow-2xs">
                      <div className="text-xs font-bold text-nature-forest flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
                          Today ({storeStatus.todayDayName})
                        </span>
                        <span className={storeStatus.isOpen ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {storeStatus.todayHoursDisplay}
                        </span>
                      </div>
                      <div className="mt-1 text-2xs text-nature-stone/75 flex items-center justify-between">
                        <span>Tomorrow ({storeStatus.tomorrowDayName})</span>
                        <span className="font-medium text-nature-forest">{storeStatus.tomorrowHoursDisplay}</span>
                      </div>
                    </div>
                  )}

                  {/* Consolidated Operating Schedule */}
                  <div className="space-y-2 text-xs text-nature-stone mb-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-nature-border/40">
                      <span className="font-semibold text-nature-forest">Tuesday – Sunday</span>
                      <span className="font-semibold text-emerald-800">9:00 AM – 8:30 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-nature-border/40">
                      <span className="font-medium text-nature-stone">Saturdays (Extended)</span>
                      <span className="font-medium text-emerald-700">9:00 AM – 9:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="font-semibold text-nature-forest">Mondays</span>
                      <span className="font-semibold text-rose-600">Closed (Care &amp; Restocking)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CALENDAR & HOLIDAYS / NOTICES */}
              {activeTab === 'calendar' && (
                <div className="space-y-3 animate-fade-in">
                  {/* Live Broadcast Banner */}
                  <div className="rounded-xl bg-emerald-50/90 border border-emerald-200/80 p-2.5 text-2xs text-emerald-950">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
                      <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>{CURRENT_STUDIO_NOTICE.availabilityStatus}</span>
                    </div>
                    <p className="text-3xs text-emerald-800 leading-relaxed">
                      {CURRENT_STUDIO_NOTICE.message}
                    </p>
                  </div>

                  {/* Month Calendar Mini-Grid */}
                  <div className="rounded-xl bg-white/90 border border-stone-200 p-2.5 shadow-2xs">
                    <div className="flex items-center justify-between mb-2 text-2xs font-bold text-nature-forest">
                      <span>{monthCalendar.monthName} {monthCalendar.year}</span>
                      <span className="text-3xs font-mono text-stone-500 font-normal">
                        🟢 Open • 🔴 Mon Closed
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-3xs">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <div key={idx} className="font-bold text-stone-400 py-0.5">
                          {day}
                        </div>
                      ))}
                      {/* Leading empty offsets */}
                      {Array.from({ length: monthCalendar.firstDayOfWeek }).map((_, idx) => (
                        <div key={`offset-${idx}`} className="py-1" />
                      ))}
                      {/* Days */}
                      {monthCalendar.days.map((d) => (
                        <div
                          key={d.dayNumber}
                          className={`py-1 rounded-md font-mono text-3xs font-medium transition-colors ${
                            d.isToday
                              ? 'bg-nature-forest text-white font-bold ring-2 ring-emerald-400 shadow-xs'
                              : d.isOpen
                              ? 'text-emerald-900 bg-emerald-50/60 hover:bg-emerald-100'
                              : 'text-stone-400 bg-rose-50/60 hover:bg-rose-100'
                          }`}
                          title={`${d.dateStr}: ${d.statusLabel}`}
                        >
                          {d.dayNumber}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Holiday Schedule */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <p className="text-3xs font-bold uppercase tracking-wider text-stone-500">
                      Upcoming Holidays &amp; Special Timings
                    </p>
                    {STORE_NOTICES.slice(0, 3).map((notice) => (
                      <div
                        key={notice.id}
                        className="rounded-lg bg-stone-50/90 border border-stone-200/80 p-2 text-3xs text-stone-700 flex items-start justify-between gap-2"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{notice.title}</p>
                          <p className="text-stone-500">{notice.dateOrPeriod}</p>
                          <p className="text-3xs text-stone-600 mt-0.5">{notice.details}</p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full font-semibold border ${notice.badgeClass}`}>
                          {notice.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="pt-4 border-t border-nature-border/40">
              {activeTab === 'timings' ? (
                <a
                  href={`tel:${STORE_INFO.callingPhone}`}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-nature-forest/20 bg-white/90 py-2.5 text-sm font-semibold text-nature-forest hover:bg-white shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Phone className="h-4 w-4 text-nature-moss" />
                  <span>Call Us: {STORE_INFO.callingPhone}</span>
                </a>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-600/30 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-whatsapp" />
                  <span>Inquire Holiday Hours on WhatsApp</span>
                </a>
              )}
            </div>
          </div>


          {/* 3. Instant Consultations Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-whatsapp shadow-sm">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-nature-forest mb-2">
                Studio Consultations
              </h3>
              <p className="text-sm text-nature-stone leading-relaxed mb-4">
                Share photos of your space, lighting conditions, or custom aquarium concepts directly with our Bangalore master botanists and aquascapers.
              </p>
              <div className="rounded-xl bg-nature-leaf/50 p-3 text-xs text-nature-moss">
                💬 <strong>Personalized guidance:</strong> Plant pairings, tank dimension planning, and live stock inquiries.
              </div>
            </div>

            <div className="pt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Consult with Botanist</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
