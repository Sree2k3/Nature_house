import React from 'react';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col animate-pulse">
      {/* Top Admin Navbar Skeleton */}
      <div className="w-full bg-white border-b border-stone-200 py-3.5 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-100" />
          <div className="h-5 w-32 bg-stone-200 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-28 bg-stone-200 rounded-xl" />
          <div className="h-8 w-20 bg-rose-100 rounded-xl" />
        </div>
      </div>

      {/* Main Admin Content Skeleton */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-2">
              <div className="h-4 w-24 bg-stone-100 rounded-md" />
              <div className="h-7 w-16 bg-stone-200 rounded-md" />
            </div>
          ))}
        </div>

        {/* Action Bar Skeleton */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
          <div className="h-10 w-64 bg-stone-100 rounded-xl" />
          <div className="h-10 w-36 bg-emerald-200/70 rounded-xl" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-stone-200" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-stone-200 rounded-md" />
                  <div className="h-3 w-24 bg-stone-100 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-emerald-100 rounded-full" />
                <div className="h-8 w-8 rounded-lg bg-stone-100" />
                <div className="h-8 w-8 rounded-lg bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
