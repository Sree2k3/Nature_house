'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ShieldCheck } from 'lucide-react';

interface PhotoLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string | null;
  onClose: () => void;
}

export default function PhotoLightbox({
  isOpen,
  imageUrl,
  title,
  onClose,
}: PhotoLightboxProps) {
  const [zoomScale, setZoomScale] = useState(1);
  const [activeImg, setActiveImg] = useState(imageUrl);

  useEffect(() => {
    setActiveImg(imageUrl);
  }, [imageUrl]);

  // Reset zoom whenever lightbox opens or closes
  useEffect(() => {
    if (isOpen) {
      setZoomScale(1);
    }
  }, [isOpen]);

  // Keyboard navigation (Esc to close, + / - to zoom)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
      if (e.key === '+' || e.key === '=') setZoomScale((s) => Math.min(s + 0.25, 2.5));
      if (e.key === '-' || e.key === '_') setZoomScale((s) => Math.max(s - 0.25, 1));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={title || 'High-Resolution Inspection'}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-between bg-black/92 p-4 backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Top Bar: Title, Zoom Controls & Close Button */}
          <div className="flex w-full max-w-5xl items-center justify-between text-white z-10 pt-2 px-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-display text-sm font-semibold sm:text-base drop-shadow truncate max-w-xs sm:max-w-md">
                {title || 'High-Resolution Inspection'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Buttons */}
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(s - 0.25, 1))}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(s + 0.25, 2.5))}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 active:scale-95 transition-all"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Centered Image with spring scale animation */}
          <div
            className="relative flex flex-1 w-full max-w-5xl items-center justify-center overflow-hidden my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ scale: zoomScale }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-h-[75vh] max-w-full overflow-hidden rounded-2xl shadow-2xl cursor-zoom-in"
              onClick={() => setZoomScale((s) => (s > 1 ? 1 : 1.75))}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImg || ''}
                alt={title || 'Enlarged photo'}
                onError={() => {
                  setActiveImg('https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=1200&q=85');
                }}
                className="max-h-[75vh] w-auto max-w-full object-contain select-none"
              />
            </motion.div>
          </div>

          {/* Bottom Bar: Care inspection notice & zoom tip (No redundant WhatsApp button) */}
          <div
            className="flex flex-col sm:flex-row w-full max-w-4xl items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-2.5 backdrop-blur-md text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs text-white/85 text-center sm:text-left">
              🔍 Inspect natural leaf variegation, roots, and machine-beveled glass joints. Click image to zoom.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition-all cursor-pointer"
            >
              Done Viewing
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
