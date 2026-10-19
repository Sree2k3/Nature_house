'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Terminal, ArrowLeft, Lock } from 'lucide-react';

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-nature-linen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-800 mb-4 shadow-sm">
          <Lock className="h-8 w-8 text-emerald-800" />
        </div>
        <h2 className="font-display text-2xl font-bold text-nature-forest">
          Local Security Recovery Protocol
        </h2>
        <p className="mt-2 text-xs text-nature-stone">
          Nature House Administrator Credential Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-stone-200/80 space-y-6">
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-nature-forest">
              <Terminal className="h-4 w-4 text-emerald-700" />
              <span>Local CLI Recovery Only</span>
            </div>
            <p className="text-2xs text-stone-600 leading-relaxed">
              To eliminate remote credential takeover vectors, password recovery is not performed over public HTTP endpoints.
              Authorized administrators must execute the local interactive command directly on the server terminal:
            </p>
            <div className="bg-stone-900 text-emerald-400 font-mono text-xs p-3 rounded-xl select-all">
              node scripts/admin-reset.mjs
            </div>
            <p className="text-3xs text-stone-500 leading-normal">
              This updates the salted password hash directly in PostgreSQL and immediately increments your account&apos;s session version, revoking all existing active sessions.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/admin/login"
              className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 bg-nature-forest text-white text-sm font-bold hover:bg-emerald-950 transition-all shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Staff Login</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-3xs text-stone-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Node.js scrypt Salted Protection • Local PostgreSQL Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
