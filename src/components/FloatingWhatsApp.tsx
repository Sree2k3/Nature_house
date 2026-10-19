'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { buildWhatsAppGeneralUrl } from '@/lib/whatsapp';
import { STORE_INFO } from '@/data/mockCatalog';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = buildWhatsAppGeneralUrl(STORE_INFO.whatsappPhone);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Gentle Floating Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-md animate-fade-in text-xs text-nature-forest">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-medium">Have questions? We are online on WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="ml-1 text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
            title="Dismiss tooltip"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-whatsapp transition-all duration-300 hover:scale-105 hover:bg-whatsapp-hover active:scale-95"
        title="Chat with Nature House on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-white text-[9px] font-bold text-whatsapp items-center justify-center">
            1
          </span>
        </span>
        <MessageCircle className="h-7 w-7 transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
}
