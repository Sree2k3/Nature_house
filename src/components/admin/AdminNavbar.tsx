'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, ExternalLink, Sparkles, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AdminNavbarProps {
  totalPlants?: number;
  totalAquariums?: number;
  outOfStockCount?: number;
}

export default function AdminNavbar({}: AdminNavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Emblem & Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-300/70 text-xl shadow-2xs">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-nature-forest sm:text-xl">
                Nature House Admin
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-3xs font-bold text-emerald-800 uppercase tracking-wider">
                Staff Portal
              </span>
            </div>
            <p className="hidden text-2xs text-nature-muted sm:block">
              Inventory Control &amp; Model Card Management
            </p>
          </div>
        </div>

        {/* Right Actions: Public Catalog Link & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-nature-forest/20 bg-nature-linen/80 px-4 py-2.5 text-sm font-semibold text-nature-forest hover:bg-white transition-all shadow-2xs active:scale-95"
            title="Open customer-facing website in new tab"
          >
            <ExternalLink className="h-4 w-4 text-nature-moss" />
            <span className="hidden sm:inline">View Public Catalog</span>
            <span className="sm:hidden">Store</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all cursor-pointer active:scale-95"
            title="Log out of staff console"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
