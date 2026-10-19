'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors for debugging
    console.error('[Nature House Error Boundary]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-nature-linen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/80 shadow-xl p-8 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-800">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-nature-forest">
            A Momentary Disturbance
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            We encountered an unexpected issue while loading the botanical catalog. Please try refreshing or return to the main showcase.
          </p>
        </div>

        {error?.message && (
          <div className="rounded-2xl bg-stone-50 border border-stone-200/70 p-3 text-left">
            <p className="text-2xs font-mono text-stone-500 break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary flex-1 py-3 rounded-2xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-stone-300 text-nature-forest hover:bg-stone-50 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Showcase</span>
          </Link>
        </div>

        <p className="text-2xs text-stone-400">
          Nature House Bangalore • Artisanal Botanicals & Aquascapes
        </p>
      </div>
    </div>
  );
}
