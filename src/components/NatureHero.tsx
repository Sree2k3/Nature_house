'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  MapPin,
  ArrowRight,
  Leaf,
  Waves,
  ShieldCheck,
  Compass,
  ArrowDown,
} from 'lucide-react';
import { StoreInfo, CatalogSection } from '@/types/catalog';

interface NatureHeroProps {
  storeInfo: StoreInfo;
  activeSection: CatalogSection;
  onSelectSection: (section: CatalogSection) => void;
  plantCount: number;
  aquariumCount: number;
}

export default function NatureHero({
  storeInfo,
  activeSection,
  onSelectSection,
  plantCount,
  aquariumCount,
}: NatureHeroProps) {

  const handlePortalClick = (section: CatalogSection) => {
    onSelectSection(section);
    const catalogElement = document.getElementById('catalog-anchor');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
      {/* 1. Ambient Background Organic Light Gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Soft Emerald Foliage Glow */}
        <div className="absolute top-10 left-1/4 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-600/7 blur-3xl animate-pulse" />
        {/* Soft Aquatic Azure Glow */}
        <div className="absolute top-24 right-1/4 h-[480px] w-[480px] translate-x-1/2 rounded-full bg-sky-500/7 blur-3xl" />
        {/* Warm Golden Sunlight Glow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 h-[380px] w-[700px] rounded-full bg-amber-200/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl text-center">
        {/* Poetic & Calming Hero Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-nature-forest leading-[1.15]"
        >
          A Sanctuary of Living Flora &amp; <br className="hidden sm:inline" />
          <span className="relative inline-block bg-gradient-to-r from-emerald-800 via-teal-700 to-aqua-azure bg-clip-text text-transparent">
            Pristine Glass Waters
          </span>
        </motion.h1>

        {/* Soothing Narrative Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-nature-stone/85 leading-relaxed font-normal"
        >
          Welcome to Nature House. We cultivate acclimatized tropical house plants and hand-craft opti-white rimless aquascapes for calm, mindful spaces. Explore our two live collections below and inquire directly with our master botanist.
        </motion.p>

        {/* Quick Exploration & Visit Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
        >
          <a
            href="#catalog-anchor"
            className="flex items-center gap-2.5 rounded-2xl bg-nature-forest px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-soft transition-all hover:bg-emerald-950 active:scale-95 group"
          >
            <span>Explore Studio Catalog</span>
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>

          <a
            href="#location"
            className="flex items-center gap-2.5 rounded-2xl border border-stone-200/90 bg-white/95 px-8 py-3.5 text-sm sm:text-base font-bold text-nature-forest shadow-xs hover:bg-white hover:border-emerald-600/30 hover:shadow-sm transition-all active:scale-95"
          >
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Visit Bangalore Nursery</span>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* 2. DUAL NATURE PORTALS: Interactive Visual Realm Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Realm A: The Living Flora Sanctuary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            onClick={() => handlePortalClick('plants')}
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${
              activeSection === 'plants'
                ? 'border-emerald-600/60 ring-2 ring-emerald-600/20 shadow-[0_20px_50px_-15px_rgba(45,106,79,0.22)]'
                : 'border-stone-200/80 hover:border-emerald-600/40 hover:shadow-[0_20px_45px_-12px_rgba(45,106,79,0.15)]'
            }`}
          >
            {/* Background Photographic Atmosphere with Ken Burns hover effect */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1000&q=80"
                alt="Living Botanical Nursery Greenery"
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-108 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nature-forest/95 via-nature-forest/50 to-black/25" />

              {/* Top Realm Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3 py-1 text-2xs font-bold text-emerald-200 backdrop-blur-md border border-emerald-500/30">
                  <Leaf className="h-3 w-3 text-emerald-400" />
                  Botanical Realm • {plantCount} Curated Specimens
                </span>
              </div>

              {/* Bottom Content within Image */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10">
                <p className="text-2xs font-bold uppercase tracking-widest text-emerald-300 mb-1">
                  Organic Potting &amp; Leaf Care
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  The Botanical Nursery
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-stone-200/90 line-clamp-2 leading-relaxed">
                  Lush split-leaf Monsteras, night-purifying Snake Plants, and cascading velvet Pothos, conditioned for low-light homes.
                </p>

                {/* Interactive Portal Action Trigger */}
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 group-hover:text-white transition-colors">
                    <span>Browse Nursery Flora</span>
                    <ArrowDown className="h-3.5 w-3.5 text-emerald-400 transition-transform group-hover:translate-y-0.5" />
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-2xs font-semibold text-white backdrop-blur-xs group-hover:bg-emerald-600 transition-colors">
                    Tap to View Plants
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Realm B: The Glass Water Sanctuary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            onClick={() => handlePortalClick('aquariums')}
            className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 cursor-pointer ${
              activeSection === 'aquariums'
                ? 'border-sky-600/60 ring-2 ring-sky-600/20 shadow-[0_20px_50px_-15px_rgba(0,119,182,0.22)]'
                : 'border-stone-200/80 hover:border-sky-600/40 hover:shadow-[0_20px_45px_-12px_rgba(0,119,182,0.15)]'
            }`}
          >
            {/* Background Photographic Atmosphere with Ken Burns hover effect */}
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1520302269460-24422e6b66e3?auto=format&fit=crop&w=1000&q=80"
                alt="Handcrafted Rimless Aquascape with Opti-White Glass"
                className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-108 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-sky-950/50 to-black/25" />

              {/* Top Realm Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-950/80 px-3 py-1 text-2xs font-bold text-sky-200 backdrop-blur-md border border-sky-500/30">
                  <Waves className="h-3 w-3 text-sky-400" />
                  Aquatic Realm • {aquariumCount} Handcrafted Builds
                </span>
              </div>

              {/* Bottom Content within Image */}
              <div className="absolute bottom-0 inset-x-0 p-6 z-10">
                <p className="text-2xs font-bold uppercase tracking-widest text-sky-300 mb-1">
                  Opti-White Low-Iron Glass &amp; Aquascapes
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Handcrafted Aquascapes
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-stone-200/90 line-clamp-2 leading-relaxed">
                  German silicone-bonded rimless tanks, 45° diamond-beveled edges, and complete aquatic scapes with bespoke wood cabinets.
                </p>

                {/* Interactive Portal Action Trigger */}
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-200 group-hover:text-white transition-colors">
                    <span>Browse Custom Aquaria</span>
                    <ArrowDown className="h-3.5 w-3.5 text-sky-400 transition-transform group-hover:translate-y-0.5" />
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-2xs font-semibold text-white backdrop-blur-xs group-hover:bg-sky-600 transition-colors">
                    Tap to View Tanks
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3. Sensory Nature Reassurance Banner */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <div className="rounded-2xl border border-stone-200/70 bg-white/85 p-3.5 backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-nature-forest">Organic Roots</span>
            </div>
            <p className="text-2xs text-nature-stone/75 leading-tight">
              Porous bark &amp; worm castings; zero transplant shock.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-white/85 p-3.5 backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0" />
              <span className="text-xs font-bold text-nature-forest">Opti-White Glass</span>
            </div>
            <p className="text-2xs text-nature-stone/75 leading-tight">
              92.5% light transmittance, zero greenish tint.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-white/85 p-3.5 backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Compass className="h-4 w-4 text-amber-700 shrink-0" />
              <span className="text-xs font-bold text-nature-forest">Cushioned Transit</span>
            </div>
            <p className="text-2xs text-nature-stone/75 leading-tight">
              Hand-carried nursery delivery across Bangalore.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-white/85 p-3.5 backdrop-blur-xs shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-nature-forest">Studio Botanist</span>
            </div>
            <p className="text-2xs text-nature-stone/75 leading-tight">
              Hands-on care guidance directly from our studio growers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
