'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { PlantItem } from '@/types/catalog';
import { buildWhatsAppPlantUrl } from '@/lib/whatsapp';
import { STORE_INFO } from '@/data/mockCatalog';

interface PlantCardProps {
  plant: PlantItem;
  onSelect: () => void;
  onOpenLightbox?: (imageUrl: string, title: string) => void;
}

export default function PlantCard({ plant, onSelect }: PlantCardProps) {
  const [imgSrc, setImgSrc] = React.useState(plant.imageUrl);

  React.useEffect(() => {
    setImgSrc(plant.imageUrl);
  }, [plant.imageUrl]);

  const whatsAppUrl = buildWhatsAppPlantUrl({
    phone: STORE_INFO.whatsappPhone,
    title: plant.title,
    botanicalName: plant.botanicalName,
    potSize: plant.potSize,
    price: plant.price,
    isInStock: plant.isInStock,
  });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/70 bg-white/85 backdrop-blur-md shadow-[0_10px_30px_-15px_rgba(45,106,79,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-emerald-700/30 hover:shadow-[0_22px_45px_-12px_rgba(45,106,79,0.20)]"
    >
      {/* 1. Photo Container with Semantic Button */}
      <button
        type="button"
        onClick={onSelect}
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100 cursor-pointer text-left block focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-inset"
        aria-label={`View details and photos for ${plant.title}`}
        title="Click to view details"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={plant.title}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => {
            setImgSrc('https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80');
          }}
        />

        {/* Ambient Gradient Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-75" />

        {/* Badges Overlay */}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {plant.badge && (
            <span className="badge-green shadow-xs text-2xs font-bold backdrop-blur-md">
              {plant.badge}
            </span>
          )}
          {plant.isInStock ? (
            <span className="badge inline-flex items-center gap-1 bg-white/95 text-emerald-800 shadow-xs backdrop-blur-md font-semibold text-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Nursery Ready
            </span>
          ) : (
            <span className="badge-sold shadow-xs font-semibold text-2xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Category Pill Overlaid at Bottom Left of Image */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-2xs font-semibold text-nature-forest shadow-xs backdrop-blur-md">
            {plant.category}
          </span>
        </div>
      </button>

      {/* 2. Content Area */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 space-y-3">
        <div>
          {/* Title */}
          <div className="mb-1.5">
            <h3 className="font-display text-base font-bold text-nature-forest transition-colors group-hover:text-nature-moss">
              {plant.title}
            </h3>
          </div>

          {/* Option for view details */}
          <button
            type="button"
            onClick={onSelect}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer inline-flex items-center gap-1"
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
                ₹{plant.price.toLocaleString('en-IN')}
              </p>
            </div>
            <span className="text-2xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
              {plant.isInStock ? 'In Stock' : 'Sold Out'}
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
