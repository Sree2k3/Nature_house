'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@naturehouse.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When visiting the login page, always invalidate any previous session so credentials must be re-entered
  React.useEffect(() => {
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both administrative email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Success -> navigate to dashboard with active session ticket
      router.push('/admin?session=active');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nature-linen flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-nature-moss selection:text-white">
      {/* Top Bar with Return link */}
      <div className="mx-auto w-full max-w-md flex items-center justify-between pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-nature-forest hover:text-nature-moss transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Public Catalog</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 text-2xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <KeyRound className="h-3 w-3" />
          <span>Secure Staff Console</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="mx-auto w-full max-w-md my-auto py-6">
        <div className="glass-card p-6 sm:p-8 bg-white/95 shadow-xl border border-stone-200/80">
          {/* Brand Emblem */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-300/60 shadow-xs text-2xl mb-3">
              🌿
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-nature-forest">
              Nature House Studio
            </h1>
            <p className="mt-1 text-xs text-nature-muted">
              Owner &amp; Inventory Management Portal
            </p>
          </div>

          {/* Error Message Box */}
          {error && (
            <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <span className="shrink-0 text-base">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5"
              >
                Admin Email ID
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@naturehouse.in"
                  className="w-full rounded-2xl border border-stone-300/80 bg-stone-50/60 pl-10 pr-3 py-2.5 text-sm text-nature-forest placeholder-stone-400 focus:border-nature-moss focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-nature-moss/20 transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-2xs font-bold uppercase tracking-wider text-nature-stone mb-1.5"
              >
                Owner Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-stone-300/80 bg-stone-50/60 pl-10 pr-12 py-2.5 text-sm text-nature-forest placeholder-stone-400 focus:border-nature-moss focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-nature-moss/20 transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <Link
                  href="/admin/reset-password"
                  className="text-2xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  Forgot or Reset Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-2xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-emerald-200" />
                  <span>Authenticate &amp; Enter Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Subtle Copyright */}
      <div className="mx-auto text-center pb-2 text-2xs text-stone-400">
        © {new Date().getFullYear()} Nature House Bangalore. Confidential Staff Console.
      </div>
    </div>
  );
}
