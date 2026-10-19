'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { AquariumItem } from '@/types/catalog';
import { buildWhatsAppAquariumUrl } from '@/lib/whatsapp';
import { STORE_INFO } from '@/data/mockCatalog';

interface AquariumCardProps {
  aquarium: AquariumItem;
  onSelect: () => void;
  onOpenLightbox?: (imageUrl: string, title: string) => void;
}

export default function AquariumCard({ aquarium, onSelect }: AquariumCardProps) {
  const [imgSrc, setImgSrc] = React.useState(aquarium.imageUrl);

  React.useEffect(() => {
    setImgSrc(aquarium.imageUrl);
  }, [aquarium.imageUrl]);

  const whatsAppUrl = buildWhatsAppAquariumUrl({
    phone: STORE_INFO.whatsappPhone,
    title: aquarium.title,
    dimensionsCm: aquarium.dimensionsCm,
    volumeLiters: aquarium.volumeLiters,
    glassThicknessMm: aquarium.glassThicknessMm,
    glassType: aquarium.glassType,
    price: aquarium.price,
    isInStock: aquarium.isInStock,
  });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-200/60 bg-white/85 backdrop-blur-md shadow-[0_10px_30px_-15px_rgba(0,119,182,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-sky-400/40 hover:shadow-[0_22px_45px_-12px_rgba(0,119,182,0.22)]"
    >
      {/* 1. Photo Container with Semantic Button */}
      <button
        type="button"
        onClick={onSelect}
        className="relative aspect-[4/3] w-full overflow-hidden bg-sky-950/15 cursor-pointer text-left block focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-inset"
        aria-label={`View details and specs for ${aquarium.title}`}
        title="Click to view details"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={aquarium.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80');
          }}
        />

        {/* Ambient Aqua Gradient Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-sky-950/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-75" />

        {/* Badges Overlay */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {aquarium.badge && (
            <span className="badge-aqua shadow-xs text-2xs font-bold backdrop-blur-md">
              {aquarium.badge}
            </span>
          )}
          {aquarium.isInStock ? (
            <span className="badge inline-flex items-center gap-1 bg-white/95 text-sky-800 shadow-xs backdrop-blur-md font-semibold text-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
              In Stock • Studio Ready
            </span>
          ) : (
            <span className="badge-sold shadow-xs font-semibold text-2xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Dimensions Overlay at Bottom Left */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-2xs font-mono font-bold text-sky-950 shadow-xs backdrop-blur-md">
            {aquarium.dimensionsCm}
          </span>
        </div>
      </button>

      {/* 2. Content Area */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 space-y-3">
        <div>
          {/* Title */}
          <div className="mb-1.5">
            <h3 className="font-display text-base font-bold text-nature-forest transition-colors group-hover:text-aqua-azure">
              {aquarium.title}
            </h3>
          </div>

          {/* Option for view details */}
          <button
            type="button"
            onClick={onSelect}
            className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span>View details &rarr;</span>
          </button>
        </div>

        {/* 3. Footer: Price & Direct Inquire Conversion */}
        <div className="pt-2 border-t border-nature-border/50">
          <div className="mb-2 flex items-baseline justify-between">
            <div>
              <span className="text-2xs uppercase tracking-wider text-nature-muted font-medium">Price</span>
              <p className="price-display text-nature-forest text-base sm:text-lg font-bold">
                ₹{aquarium.price.toLocaleString('en-IN')}
              </p>
            </div>
            <span className="text-2xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full font-semibold">
              {aquarium.isInStock ? 'In Stock' : 'Sold Out'}
            </span>
          </div>

          {/* Inquire Button */}
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-whatsapp rounded-2xl py-2.5 px-4 text-sm font-bold shadow-xs justify-center flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span>Inquire</span>
          </a>
        </div>
      </div>
    </motion.article>
  );
}
