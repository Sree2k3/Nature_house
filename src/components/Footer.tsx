'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Clock,
  MessageCircle,
  ShieldCheck,
  Lock,
  X,
  Car,
} from 'lucide-react';
import { STORE_INFO } from '@/data/mockCatalog';
import { getStoreStatus, StoreStatus, StoreNotice } from '@/lib/storeHours';
import { buildWhatsAppGeneralUrl } from '@/lib/whatsapp';

export default function Footer() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [notices, setNotices] = useState<StoreNotice[] | undefined>(undefined);

  useEffect(() => {
    // Fetch live schedule with custom holiday notices
    fetch('/api/schedule', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.notices) setNotices(data.notices);
        if (data?.storeStatus) setStoreStatus(data.storeStatus);
      })
      .catch(() => {
        setStoreStatus(getStoreStatus());
      });
  }, []);

  useEffect(() => {
    setStoreStatus(getStoreStatus(notices));
    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus(notices));
    }, 60000);
    return () => clearInterval(interval);
  }, [notices]);

  const whatsappUrl = buildWhatsAppGeneralUrl(STORE_INFO.whatsappPhone);

  return (
    <footer id="location" className="w-full border-t border-[#247746]/80 bg-[#075D3B] text-stone-100 pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Consolidated Studio Sanctuary Details Grid — All 3 uniform cards in 1 line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pb-12 border-b border-[#247746]/40">
          {/* Card 1: Physical Nursery & Studio */}
          <div className="rounded-3xl bg-[#05492e]/60 border border-[#247746]/40 p-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">🌿</span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white">
                  {STORE_INFO.storeName}
                </h3>
              </div>
              <p className="text-2xs text-emerald-300/90 font-serif italic mb-3">
                {STORE_INFO.tagline}
              </p>
              <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">
                {STORE_INFO.addressLine1}<br />
                {STORE_INFO.addressLine2}<br />
                {STORE_INFO.city}, West Bengal — {STORE_INFO.pincode}
              </p>
              <p className="text-2xs text-emerald-300/90 flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Dedicated customer parking available on premises</span>
              </p>
            </div>
            <div className="pt-2">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center text-sm font-bold shadow-sm active:scale-95"
              >
                <Navigation className="h-4 w-4 text-emerald-700" />
                <span>Get Turn-by-Turn Directions &rarr;</span>
              </a>
            </div>
          </div>

          {/* Card 2: Consolidated Store Hours & Timings */}
          <div className="rounded-3xl bg-[#05492e]/60 border border-[#247746]/40 p-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-display text-base sm:text-lg font-bold text-white">
                    Store Hours &amp; Timings
                  </h3>
                </div>
                {storeStatus && (
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold border ${
                    storeStatus.isOpen
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/40'
                      : 'bg-stone-900/90 text-amber-300 border-amber-600/40'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${storeStatus.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    {storeStatus.isOpen ? 'Open Now' : 'Closed Now'}
                  </span>
                )}
              </div>

              {storeStatus && (
                <div className="rounded-xl bg-black/25 p-3 border border-emerald-700/30 text-xs space-y-1 mb-3">
                  <div className="font-semibold text-emerald-100 flex justify-between items-center">
                    <span>Today ({storeStatus.todayDayName}):</span>
                    <span className={storeStatus.isOpen ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>{storeStatus.todayHoursDisplay}</span>
                  </div>
                  <div className="text-emerald-200/70 flex justify-between items-center text-2xs">
                    <span>Tomorrow ({storeStatus.tomorrowDayName}):</span>
                    <span>{storeStatus.tomorrowHoursDisplay}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-stone-200">
                <div className="flex justify-between items-center py-2 border-b border-emerald-800/40">
                  <span className="font-medium text-emerald-100/90">Monday – Saturday</span>
                  <span className="font-mono text-white font-semibold">9:00 AM – 8:30 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 text-rose-200 bg-rose-950/40 border border-rose-800/30 px-2.5 rounded-lg">
                  <span className="font-medium text-rose-300">Sundays</span>
                  <span className="text-2xs font-semibold text-rose-200">Closed (Holiday &amp; Sanctuary Care)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Studio Consultations & Inquiries */}
          <div className="rounded-3xl bg-[#05492e]/60 border border-[#247746]/40 p-6 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <h3 className="font-display text-base sm:text-lg font-bold text-white">
                  Studio Consultations
                </h3>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed mb-3">
                Share photos of your space, lighting conditions, or custom aquarium concepts directly with our Adra master botanists and aquascapers.
              </p>
              <p className="text-2xs text-emerald-300/80 leading-relaxed">
                Direct nursery assistance for plant health, custom rimless tank sizing, and in-stock inventory inquiries.
              </p>
            </div>
            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center text-sm font-bold shadow-sm active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Consult with Botanist</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Privacy Policy & Staff Login */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/60">
          <p>© {new Date().getFullYear()} Nature House Botanical Studio. All rights reserved.</p>

          <div className="flex items-center gap-4 font-medium text-emerald-100/80">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>DPDP 2023 Privacy Policy</span>
            </button>

            <span className="text-emerald-800">•</span>

            <a
              href="/admin/login"
              className="flex items-center gap-1 text-emerald-300/60 hover:text-white transition-colors"
              title="Staff Admin Console"
            >
              <Lock className="h-3 w-3" />
              <span>Staff Login</span>
            </a>
          </div>
        </div>
      </div>

      {/* Lightweight Privacy Commitment Modal (DPDP Act 2023 Compliant) */}
      {isPrivacyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsPrivacyModalOpen(false)}
        >
          <div
            className="glass-card max-w-lg w-full p-6 bg-white text-nature-stone relative max-h-[85vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
              aria-label="Close privacy notice"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-display text-lg font-bold text-nature-forest">
                Privacy Commitment &amp; Notice
              </h3>
            </div>

            <div className="space-y-3 text-xs text-nature-stone leading-relaxed">
              <p>
                <strong>Zero-Tracking Guarantee:</strong> Nature House respects your privacy. We do not track your browsing habits, run advertising pixels, or store cookies on your device.
              </p>
              <p>
                <strong>WhatsApp Inquiries:</strong> When you tap any WhatsApp inquiry button, you are redirected directly to WhatsApp’s end-to-end encrypted platform. Any delivery addresses or contact details you choose to share are used solely to fulfill your order.
              </p>
              <p>
                <strong>DPDP Act 2023 Compliance:</strong> We do not collect or sell personal customer data. You may request deletion of previous chat interactions at any time by messaging us.
              </p>
              <p className="pt-2 border-t border-nature-border text-nature-muted">
                <strong>Data Fiduciary Contact:</strong> Dev (Proprietor), Nature House, Ashram Para, Near East Rly Cabin, Adra, Purulia, West Bengal — 723121.
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
