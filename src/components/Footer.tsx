'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
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
    setStoreStatus(getStoreStatus());

    // Fetch live schedule with custom holiday notices
    fetch('/api/schedule', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.notices) setNotices(data.notices);
        if (data?.storeStatus) setStoreStatus(data.storeStatus);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setStoreStatus(getStoreStatus(notices));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const whatsappUrl = buildWhatsAppGeneralUrl(STORE_INFO.whatsappPhone);

  return (
    <footer id="location" className="w-full border-t border-nature-border bg-stone-100/70 pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Consolidated Studio Sanctuary Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-200/80">
          {/* Col 1: Physical Nursery & Studio */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h3 className="font-display text-lg font-bold text-nature-forest">
                {STORE_INFO.storeName}
              </h3>
            </div>
            <p className="text-xs text-nature-stone leading-relaxed">
              {STORE_INFO.addressLine1}<br />
              {STORE_INFO.addressLine2}<br />
              {STORE_INFO.city}, Karnataka — {STORE_INFO.pincode}
            </p>
            <p className="text-2xs text-nature-muted flex items-center gap-1.5">
              <Car className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Dedicated customer parking available on premises</span>
            </p>
            <div className="pt-2">
              <a
                href={STORE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full justify-center text-sm font-bold shadow-xs active:scale-95"
              >
                <Navigation className="h-4 w-4 text-nature-moss" />
                <span>Get Turn-by-Turn Directions &rarr;</span>
              </a>
            </div>
          </div>

          {/* Col 2: Consolidated Store Hours & Timings */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-nature-moss" />
                <h4 className="font-display text-sm font-bold text-nature-forest">
                  Store Hours &amp; Timings
                </h4>
              </div>
              {storeStatus && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-bold border ${storeStatus.badgeClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${storeStatus.isOpen ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                  {storeStatus.isOpen ? 'Open Now' : 'Closed Now'}
                </span>
              )}
            </div>

            {storeStatus && (
              <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/50 text-xs space-y-1">
                <div className="font-semibold text-nature-forest flex justify-between items-center">
                  <span>Today ({storeStatus.todayDayName}):</span>
                  <span className={storeStatus.isOpen ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>{storeStatus.todayHoursDisplay}</span>
                </div>
                <div className="text-nature-stone/80 flex justify-between items-center text-2xs">
                  <span>Tomorrow ({storeStatus.tomorrowDayName}):</span>
                  <span>{storeStatus.tomorrowHoursDisplay}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-nature-stone">
              <div className="flex justify-between items-center py-1.5 border-b border-stone-200/50">
                <span className="font-medium">Tuesday – Sunday</span>
                <span className="font-mono text-nature-forest font-semibold">9:00 AM – 8:30 PM</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-stone-200/50">
                <span className="font-medium">Saturdays (Extended)</span>
                <span className="font-mono text-nature-forest font-semibold">9:00 AM – 9:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1.5 text-rose-800 bg-rose-50/60 px-2.5 rounded-lg">
                <span className="font-medium">Mondays</span>
                <span className="text-2xs font-semibold">Closed (Care &amp; Restocking)</span>
              </div>
            </div>
          </div>

          {/* Col 3: Studio Consultations & Inquiries */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-nature-moss" />
              <h4 className="font-display text-sm font-bold text-nature-forest">
                Studio Consultations
              </h4>
            </div>
            <p className="text-xs text-nature-stone/80 leading-relaxed">
              Share photos of your space, lighting conditions, or custom aquarium concepts directly with our Bangalore master botanists and aquascapers.
            </p>
            <p className="text-2xs text-nature-moss bg-nature-leaf/50 px-3 py-2 rounded-xl leading-relaxed">
              💬 <strong>Personalized guidance:</strong> Plant pairings, tank dimension planning, and live stock inquiries.
            </p>
            <div className="space-y-2.5 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full justify-center text-sm sm:text-base font-bold rounded-2xl py-3.5 shadow-md active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Consult with Botanist</span>
              </a>
              <a
                href={`tel:${STORE_INFO.callingPhone}`}
                className="btn-secondary w-full justify-center text-sm font-bold shadow-xs active:scale-95"
              >
                <Phone className="h-4 w-4 text-stone-500" />
                <span>Call Us: {STORE_INFO.callingPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Privacy Policy & Staff Login */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-nature-muted">
          <p>© {new Date().getFullYear()} Nature House Botanical Studio. All rights reserved.</p>

          <div className="flex items-center gap-4 font-medium text-nature-stone">
            <button
              onClick={() => setIsPrivacyModalOpen(true)}
              className="flex items-center gap-1 hover:text-nature-moss transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>DPDP 2023 Privacy Policy</span>
            </button>

            <span className="text-stone-300">•</span>

            <a
              href="/admin/login"
              className="flex items-center gap-1 text-stone-400 hover:text-nature-forest transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsPrivacyModalOpen(false)}
        >
          <div
            className="glass-card max-w-lg w-full p-6 bg-white relative max-h-[85vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPrivacyModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
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
                <strong>Data Fiduciary Contact:</strong> Dev (Proprietor), Nature House Studio, Green Avenue, Bangalore.
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
