import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-nature-linen flex flex-col animate-pulse">
      {/* Top Banner Ribbon Skeleton */}
      <div className="w-full bg-emerald-950/80 py-2 px-4 flex items-center justify-center">
        <div className="h-3 w-64 bg-emerald-900/60 rounded-full" />
      </div>

      {/* Header Skeleton */}
      <header className="w-full border-b border-stone-200/70 bg-white/80 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100/70" />
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-stone-200 rounded-md" />
              <div className="h-3 w-48 bg-stone-100 rounded-md hidden sm:block" />
            </div>
          </div>
          <div className="h-9 w-44 rounded-2xl bg-emerald-50 border border-emerald-100" />
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <div className="w-full py-12 px-4 text-center max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-32 bg-emerald-100/80 rounded-full mx-auto" />
        <div className="h-10 w-3/4 bg-stone-200/80 rounded-xl mx-auto" />
        <div className="h-4 w-2/3 bg-stone-100 rounded-md mx-auto" />
      </div>

      {/* Section Switcher & Search Skeleton */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 mb-8">
        <div className="flex justify-center gap-3">
          <div className="h-11 w-44 bg-nature-forest/20 rounded-2xl" />
          <div className="h-11 w-44 bg-stone-200/70 rounded-2xl" />
        </div>
        <div className="h-10 max-w-md mx-auto bg-white rounded-2xl border border-stone-200" />
      </div>

      {/* Product Cards Grid Skeleton (6 items) */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-stone-200/70 bg-white p-4 space-y-4 shadow-xs"
          >
            <div className="aspect-[4/3] w-full rounded-2xl bg-stone-200/70" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-stone-200 rounded-md" />
              <div className="h-3.5 w-1/2 bg-stone-100 rounded-md" />
            </div>
            <div className="pt-2 flex justify-between items-center border-t border-stone-100">
              <div className="h-6 w-20 bg-stone-200 rounded-md" />
              <div className="h-8 w-28 bg-emerald-100/80 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
