'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, MessageCircle, MapPin, ArrowRight, Search, X, Leaf, Waves, LayoutGrid, Grid3X3 } from 'lucide-react';
import Header from '@/components/Header';
import NatureHero from '@/components/NatureHero';
import SectionSwitcher from '@/components/SectionSwitcher';
import CategoryFilter from '@/components/CategoryFilter';
import PlantCard from '@/components/PlantCard';
import AquariumCard from '@/components/AquariumCard';
import ItemDetailModal, { SelectedCatalogItem } from '@/components/ItemDetailModal';
import PhotoLightbox from '@/components/PhotoLightbox';
import SanctuaryHighlights from '@/components/SanctuaryHighlights';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { PlantItem, AquariumItem, CatalogSection, StoreInfo } from '@/types/catalog';

interface CatalogClientProps {
  initialPlants: PlantItem[];
  initialAquariums: AquariumItem[];
  plantCategories: string[];
  aquaCategories: string[];
  storeInfo: StoreInfo;
}

export default function CatalogClient({
  initialPlants,
  initialAquariums,
  plantCategories,
  aquaCategories,
  storeInfo,
}: CatalogClientProps) {
  // Reactive catalog state ensuring real-time card synchronization
  const [plants, setPlants] = useState<PlantItem[]>(initialPlants);
  const [aquariums, setAquariums] = useState<AquariumItem[]>(initialAquariums);
  const [plantCatList, setPlantCatList] = useState<string[]>(plantCategories);
  const [aquaCatList, setAquaCatList] = useState<string[]>(aquaCategories);

  const [activeSection, setActiveSection] = useState<CatalogSection>('plants');
  const [activePlantCategory, setActivePlantCategory] = useState<string>('All Plants');
  const [activeAquaCategory, setActiveAquaCategory] = useState<string>('All Aquariums');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state whenever props update from SSR
  useEffect(() => {
    setPlants(initialPlants);
  }, [initialPlants]);

  useEffect(() => {
    setAquariums(initialAquariums);
  }, [initialAquariums]);

  useEffect(() => {
    setPlantCatList(plantCategories);
  }, [plantCategories]);

  useEffect(() => {
    setAquaCatList(aquaCategories);
  }, [aquaCategories]);

  // Real-time synchronization fetcher with cooldown to avoid spamming the dev server
  const lastFetchRef = React.useRef<number>(Date.now());

  const refreshCatalog = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchRef.current < 10000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      const res = await fetch('/api/catalog', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plants)) setPlants(data.plants);
        if (Array.isArray(data.aquariums)) setAquariums(data.aquariums);
        if (Array.isArray(data.plantCategories)) setPlantCatList(data.plantCategories);
        if (Array.isArray(data.aquaCategories)) setAquaCatList(data.aquaCategories);
      }
    } catch {
      // Retain optimistic UI on network hiccups
    }
  }, []);

  // Sync on window focus or visibility change without redundant duplicate triggers
  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        refreshCatalog();
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
    };
  }, [refreshCatalog]);

  // Layout Grid Switcher: 3 columns vs 4 columns
  const [columnsMode, setColumnsMode] = useState<'3' | '4'>('3');

  // Enlarge Card Detail Modal State
  const [selectedItem, setSelectedItem] = useState<SelectedCatalogItem>(null);

  // Pure Photo Lightbox State
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    title: string | null;
  }>({
    isOpen: false,
    imageUrl: null,
    title: null,
  });

  const handleOpenLightbox = (imageUrl: string, title: string) => {
    setLightboxState({ isOpen: true, imageUrl, title });
  };

  const handleCloseLightbox = () => {
    setLightboxState({ isOpen: false, imageUrl: null, title: null });
  };

  // Filtered Plants with Category + Search
  const filteredPlants = useMemo(() => {
    let list = plants;
    if (activePlantCategory !== 'All Plants') {
      list = list.filter((p) => p.category === activePlantCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.botanicalName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activePlantCategory, plants, searchQuery]);

  // Filtered Aquariums with Category + Search
  const filteredAquariums = useMemo(() => {
    let list = aquariums;
    if (activeAquaCategory !== 'All Aquariums') {
      list = list.filter((a) => a.category === activeAquaCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.style.toLowerCase().includes(q) ||
          a.glassType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeAquaCategory, aquariums, searchQuery]);

  const gridClass =
    columnsMode === '3'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7'
      : 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5';

  return (
    <div className="flex min-h-screen flex-col bg-nature-linen selection:bg-nature-moss selection:text-white">
      {/* 1. Sticky Header with Live Status & Banner */}
      <Header />

      {/* 2. Soothing Nature Sanctuary Hero Presentation */}
      <NatureHero
        storeInfo={storeInfo}
        activeSection={activeSection}
        onSelectSection={(sec) => {
          setActiveSection(sec);
          setSearchQuery('');
        }}
        plantCount={plants.length}
        aquariumCount={aquariums.length}
      />

      {/* Catalog Anchor */}
      <div id="catalog-anchor" className="scroll-mt-24" />

      {/* 3. Section Switcher (Plants ⇄ Aquariums) with Filter & Search */}
      <section className="sticky top-[61px] z-30 bg-nature-linen/95 backdrop-blur-md py-4 border-b border-stone-200/60 shadow-xs">
        <SectionSwitcher
          activeSection={activeSection}
          onSectionChange={(sec) => {
            setActiveSection(sec);
            setSearchQuery('');
          }}
          plantCount={plants.length}
          aquariumCount={aquariums.length}
        />

        {/* Dynamic Category Filter Pills */}
        <div className="mt-3">
          {activeSection === 'plants' ? (
            <CategoryFilter
              categories={plantCatList}
              activeCategory={activePlantCategory}
              onSelectCategory={(cat) => setActivePlantCategory(cat)}
              accentColor="nature"
            />
          ) : (
            <CategoryFilter
              categories={aquaCatList}
              activeCategory={activeAquaCategory}
              onSelectCategory={(cat) => setActiveAquaCategory(cat)}
              accentColor="aqua"
            />
          )}
        </div>

        {/* Live Search & Layout View Controls */}
        <div className="mx-auto max-w-4xl px-4 mt-3 flex items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSection === 'plants'
                  ? 'Search plants, light, or foliage...'
                  : 'Search tanks, glass thickness, volume...'
              }
              className="w-full rounded-full border border-stone-200/80 bg-white/90 py-1.5 pl-9 pr-8 text-xs text-nature-stone placeholder:text-stone-400 focus:border-nature-moss focus:outline-none focus:ring-2 focus:ring-nature-moss/20 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Layout Grid Switcher (3 Cards vs 4 Cards) */}
          <div className="flex items-center gap-1 rounded-full border border-stone-200/80 bg-white/90 p-1 shadow-2xs shrink-0">
            <button
              onClick={() => setColumnsMode('3')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                columnsMode === '3'
                  ? 'bg-nature-forest text-white shadow-xs'
                  : 'text-stone-500 hover:text-nature-stone'
              }`}
              title="3-Column Editorial Gallery (Spacious)"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">3 Cards</span>
              <span className="sm:hidden text-2xs">3</span>
            </button>

            <button
              onClick={() => setColumnsMode('4')}
              className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                columnsMode === '4'
                  ? 'bg-nature-forest text-white shadow-xs'
                  : 'text-stone-500 hover:text-nature-stone'
              }`}
              title="4-Column Compact Showcase"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">4 Cards</span>
              <span className="sm:hidden text-2xs">4</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Active Catalog Grid */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full">
        {/* Soothing Biophilic Atmospheric Section Aura Banner */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 p-5 sm:p-6 shadow-[0_10px_35px_-15px_rgba(45,106,79,0.08)] backdrop-blur-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl border shadow-xs ${
                  activeSection === 'plants'
                    ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-emerald-200/80 text-emerald-800'
                    : 'bg-gradient-to-br from-sky-100 to-sky-50 border-sky-200/80 text-sky-800'
                }`}
              >
                {activeSection === 'plants' ? '🌿' : '🐟'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-nature-forest">
                    {activeSection === 'plants'
                      ? 'Living Botanical Nursery'
                      : 'Artisanal Opti-White Aquascapes'}
                  </h2>
                  <span
                    className={`hidden sm:inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${
                      activeSection === 'plants'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {activeSection === 'plants'
                      ? `${filteredPlants.length} Flora Available`
                      : `${filteredAquariums.length} Handcrafted Builds`}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-nature-stone/80 mt-1 leading-relaxed">
                  {activeSection === 'plants'
                    ? 'Root-conditioned in bio-organic potting mix for minimal transplant shock. Tap any card to view detailed botanist care tips.'
                    : 'Crafted with 92.5% light transmission low-iron glass and German silicone. Custom cabinet & dimension builds welcome.'}
                </p>
              </div>
            </div>

            {/* Quick Informational Guidance Pill (No redundant WhatsApp button) */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-stone-200/50 pt-2.5 md:pt-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100/90 px-3.5 py-1 text-2xs font-semibold text-nature-forest border border-stone-200/70">
                <span>{activeSection === 'plants' ? '🌿 Click any specimen to enlarge & inquire' : '💎 Click any tank for full specs & quote'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Cards Grid with dynamic 3 or 4 column layout */}
        <AnimatePresence mode="wait">
          {activeSection === 'plants' ? (
            filteredPlants.length > 0 ? (
              <motion.div
                layout
                key={`plants-grid-${activePlantCategory}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={gridClass}
              >
                {filteredPlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    onSelect={() => setSelectedItem({ type: 'plant', item: plant })}
                    onOpenLightbox={handleOpenLightbox}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-emerald-300/80 bg-emerald-50/40 backdrop-blur-xs max-w-lg mx-auto">
                <span className="text-4xl block mb-2">🌿</span>
                <p className="text-base font-display font-bold text-nature-forest">
                  No plants match &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-nature-stone/75 mt-1 max-w-sm mx-auto">
                  We frequently receive fresh unlisted tropical specimens in our Bangalore nursery. Message our botanist directly to check greenhouse stock.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActivePlantCategory('All Plants');
                    }}
                    className="rounded-full bg-nature-forest text-white px-5 py-2.5 text-xs font-semibold hover:bg-nature-forest/90 transition-all cursor-pointer shadow-xs"
                  >
                    View All Plants
                  </button>
                </div>
              </div>
            )
          ) : filteredAquariums.length > 0 ? (
            <motion.div
              layout
              key={`aquarium-grid-${activeAquaCategory}-${searchQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={gridClass}
            >
              {filteredAquariums.map((aquarium) => (
                <AquariumCard
                  key={aquarium.id}
                  aquarium={aquarium}
                  onSelect={() => setSelectedItem({ type: 'aquarium', item: aquarium })}
                  onOpenLightbox={handleOpenLightbox}
                />
              ))}
            </motion.div>
          ) : (
            <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-sky-300/80 bg-sky-50/40 backdrop-blur-xs max-w-lg mx-auto">
              <span className="text-4xl block mb-2">🌊</span>
              <p className="text-base font-display font-bold text-nature-forest">
                No aquariums match &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-nature-stone/75 mt-1 max-w-sm mx-auto">
                We custom-build tanks to any millimeter specification. Message us with your required dimensions for a direct workshop quote.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveAquaCategory('All Aquariums');
                  }}
                  className="rounded-full bg-nature-forest text-white px-5 py-2.5 text-xs font-semibold hover:bg-nature-forest/90 transition-all cursor-pointer shadow-xs"
                >
                  View All Aquariums
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* 5. Soothing Sanctuary Promise & Highlights Section */}
      <SanctuaryHighlights />

      {/* 6. Footer with Consolidated Sanctuary Details, Privacy & Staff link */}
      <Footer />

      {/* 8. Mesmerizing Enlarge Card Detail Modal */}
      <ItemDetailModal
        selected={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenPhotoZoom={(img, t) => {
          setSelectedItem(null);
          handleOpenLightbox(img, t);
        }}
      />

      {/* 9. Full-Screen Photo Zoom Lightbox Modal */}
      <PhotoLightbox
        isOpen={lightboxState.isOpen}
        imageUrl={lightboxState.imageUrl}
        title={lightboxState.title}
        onClose={handleCloseLightbox}
      />

      {/* 10. Floating WhatsApp Quick-Consultation Button */}
      <FloatingWhatsApp />
    </div>
  );
}
