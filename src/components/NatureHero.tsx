'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Leaf,
  Waves,
  ArrowDown,
} from 'lucide-react';
import { StoreInfo, CatalogSection } from '@/types/catalog';

interface NatureHeroProps {
  storeInfo?: StoreInfo;
  activeSection: CatalogSection;
  onSelectSection: (section: CatalogSection) => void;
  plantCount: number;
  aquariumCount: number;
}

export default function NatureHero({
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
    <>
      {/* 1. Dedicated Premium Hero Banner — Clearly Visible Background Tree with Light Green Tint */}
      <section className="relative w-full overflow-hidden text-white pt-16 pb-18 sm:pt-22 sm:pb-24 md:pt-26 md:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#247746]/80">
        {/* Layer 0: Photographic Tree Background Image (Guaranteed Visible Layer) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
          style={{
            backgroundImage: "url('/background-tree.avif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/background-tree.avif"
            alt="Nature House Botanical Tree"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>

        {/* Layer 1: Lighter Green Tint Overlay (#075D3B) — Translucent so tree is clearly visible */}
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden select-none" aria-hidden="true">
          {/* Light Translucent Green Wash (35% opacity) */}
          <div className="absolute inset-0 bg-[#075D3B]/35" />
          {/* Soft vignette to ensure text readability while preserving tree visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#075D3B]/45 via-transparent to-[#075D3B]/55" />
          {/* Soft Leaf Green Ambient Glow (#247746) */}
          <div className="absolute top-12 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#247746]/15 blur-3xl" />
          {/* Soft Aquatic Azure Ambient Glow (#8FC9D6) */}
          <div className="absolute top-20 right-1/4 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-[#8FC9D6]/10 blur-3xl" />
        </div>

        {/* Central Brand Composition — World-Class Luxury Botanical & Aquatic Editorial (Sections 4.B, 4.C, 5, 8) */}
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          {/* Main Brand Heading: NATURE HOUSE — Kept strictly in one line across all viewports */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="font-serif text-[1.65rem] xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-[0.08em] sm:tracking-[0.18em] md:tracking-[0.22em] text-white uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.55)] select-none whitespace-nowrap inline-block"
          >
            NATURE HOUSE
          </motion.h1>

          {/* Official Tagline: Exactly "A perfect place for nature lovers..." in Refined Italic Serif (Pure White) */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="font-serif italic text-white text-base sm:text-2xl md:text-3xl lg:text-4xl mt-3 sm:mt-4 tracking-wide font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] select-none"
          >
            A perfect place for nature lovers...
          </motion.p>

          {/* Centered Decorative Botanical and Aquatic Identity Strip (Section 5) — Warm Ivory Refined Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.26 }}
            className="mt-7 sm:mt-8 inline-flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 md:gap-6 rounded-full bg-[#F8F7F0]/95 px-6 py-2.5 sm:px-8 sm:py-3 shadow-[0_12px_32px_-8px_rgba(11,42,30,0.35)] border border-[#F8F7F0]/90 backdrop-blur-md max-w-full"
            aria-label="Nature House Botanical and Aquatic Elements"
          >
            {/* 1. Flowering Botanical Bloom */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Botanical Flowering Flora">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#23764D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 7.5C10.5 5 8 5 6.5 6.5C5 8 5 10.5 7.5 12C5 13.5 5 16 6.5 17.5C8 19 10.5 19 12 16.5C13.5 19 16 19 17.5 17.5C19 16 19 13.5 16.5 12C19 10.5 19 8 17.5 6.5C16 5 13.5 5 12 7.5Z" fill="#FCE7F3" stroke="#BE185D" strokeWidth="1.2" />
                <circle cx="12" cy="12" r="2.2" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
              </svg>
            </span>

            {/* 2. Fresh Green Botanical Sprig */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Fresh Botanical Sprig">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#23764D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 21C5 14 10 9 19 5C19 14 14 19 5 21Z" fill="#D1FAE5" stroke="#059669" strokeWidth="1.3" />
                <path d="M5 21L13 13" stroke="#047857" strokeWidth="1.4" />
                <path d="M13 13C12 9 8 7 8 7" stroke="#059669" strokeWidth="1.2" />
              </svg>
            </span>

            {/* 3. Potted Tropical Plant */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Potted Home Specimen">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#80543B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 14L8.2 20.2C8.3 20.7 8.8 21 9.3 21H14.7C15.2 21 15.7 20.7 15.8 20.2L17 14H7Z" fill="#FED7AA" stroke="#9A3412" strokeWidth="1.3" />
                <path d="M6 14H18" stroke="#9A3412" strokeWidth="1.5" />
                <path d="M12 14V8" stroke="#059669" strokeWidth="1.4" />
                <path d="M12 9C9.5 7.5 8 5 10 3C12 5 12 7.5 12 9Z" fill="#A7F3D0" stroke="#047857" strokeWidth="1.2" />
                <path d="M12 11C14.5 9.5 16 7 14 5C12 7 12 9.5 12 11Z" fill="#A7F3D0" stroke="#047857" strokeWidth="1.2" />
              </svg>
            </span>

            {/* 4. Sacred Aquatic Lotus */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Sacred Water Lotus">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5C10.5 8 10 11 12 15C14 11 13.5 8 12 5Z" fill="#FCE7F3" stroke="#BE185D" strokeWidth="1.2" />
                <path d="M7 9C7.5 12 9 14 12 15C10 13 8.5 10.5 7 9Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.1" />
                <path d="M17 9C16.5 12 15 14 12 15C14 13 15.5 10.5 17 9Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1.1" />
                <path d="M4 17C8 19 16 19 20 17" stroke="#059669" strokeWidth="1.3" />
              </svg>
            </span>

            {/* 5. Clear Pure Water Droplet */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Pristine Water Droplet">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3C8 9 6 12 6 15C6 18.3 8.7 21 12 21C15.3 21 18 18.3 18 15C18 12 16 9 12 3Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.3" />
                <path d="M9.5 14C9.5 16 10.5 17.5 12.5 18" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>

            {/* 6. Ornamental Tropical Fish */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Tropical Aquascaping Fish">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12C15 8 9 9 5 12C9 15 15 16 19 12Z" fill="#CCFBF1" stroke="#0D9488" strokeWidth="1.3" />
                <path d="M5 12L2 9V15L5 12Z" fill="#99F6E4" stroke="#0D9488" strokeWidth="1.2" />
                <circle cx="16" cy="11.5" r="1.1" fill="#0F766E" />
                <path d="M11 10.5Q12 12 11 13.5" stroke="#14B8A6" strokeWidth="1" />
              </svg>
            </span>

            {/* 7. Riverbed Spiral Shell */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Riverbed Hardscape Shell">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.3" />
                <path d="M12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12" stroke="#B45309" strokeWidth="1.2" />
                <path d="M12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10" stroke="#92400E" strokeWidth="1.2" />
              </svg>
            </span>

            {/* 8. Subtle Living Butterfly */}
            <span className="group flex items-center justify-center transition-transform hover:scale-120 cursor-default" title="Living Garden Butterfly">
              <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6V18" stroke="#1F2937" strokeWidth="1.4" />
                <path d="M12 7C14 3 20 4 20 9C20 13 14 14 12 13" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.2" />
                <path d="M12 7C10 3 4 4 4 9C4 13 10 14 12 13" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1.2" />
                <path d="M12 13C15 14 18 17 16 20C14 22 12 18 12 16" fill="#DDD6FE" stroke="#6D28D9" strokeWidth="1.1" />
                <path d="M12 13C9 14 6 17 8 20C10 22 12 18 12 16" fill="#DDD6FE" stroke="#6D28D9" strokeWidth="1.1" />
              </svg>
            </span>
          </motion.div>

          {/* Supporting Description (Sections 2 & 8) — Pure White */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32 }}
            className="mx-auto mt-6 sm:mt-7 max-w-2xl text-xs sm:text-sm md:text-base text-white tracking-wide leading-relaxed font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
          >
            Discover the beauty of botanical greenery and peaceful aquatic worlds.
          </motion.p>
        </div>
      </section>

      {/* 2. Action Bar & Dual Nature Portals Section (Linen Backdrop) */}
      <section className="relative w-full pt-8 pb-12 sm:pt-10 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          {/* Quick Exploration & Visit Action Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <a
              href="#catalog-anchor"
              className="flex items-center gap-2.5 rounded-2xl bg-nature-forest px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-soft transition-all hover:bg-emerald-950 active:scale-95 group cursor-pointer"
            >
              <span>Explore Studio Catalog</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>

            <a
              href="#location"
              className="flex items-center gap-2.5 rounded-2xl border border-stone-200/90 bg-white/95 px-8 py-3.5 text-sm sm:text-base font-bold text-nature-forest shadow-xs hover:bg-white hover:border-emerald-600/30 hover:shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>Visit Adra Nursery</span>
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
                onError={(e) => {
                  e.currentTarget.src = '/pics/Futura-Superba-Snake-plant.webp';
                }}
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
                src="https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80"
                alt="Handcrafted Rimless Aquascape with Opti-White Glass"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=1000&q=80';
                }}
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
      </div>
    </section>
  </>
);
}
