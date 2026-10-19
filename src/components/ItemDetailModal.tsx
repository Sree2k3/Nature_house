'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Phone,
  Sun,
  Droplets,
  Box,
  Sparkles,
  ShieldCheck,
  Droplet,
  Layers,
  Armchair,
  Compass,
  MapPin,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { PlantItem, AquariumItem } from '@/types/catalog';
import { buildWhatsAppPlantUrl, buildWhatsAppAquariumUrl } from '@/lib/whatsapp';
import { STORE_INFO } from '@/data/mockCatalog';

export type SelectedCatalogItem =
  | { type: 'plant'; item: PlantItem }
  | { type: 'aquarium'; item: AquariumItem }
  | null;

interface ItemDetailModalProps {
  selected: SelectedCatalogItem;
  onClose: () => void;
  onOpenPhotoZoom: (imageUrl: string, title: string) => void;
}

export default function ItemDetailModal({
  selected,
  onClose,
  onOpenPhotoZoom,
}: ItemDetailModalProps) {
  const isPlant = selected?.type === 'plant';
  const plant = isPlant ? (selected?.item as PlantItem) : null;
  const aquarium = !isPlant ? (selected?.item as AquariumItem) : null;
  const rawImageUrl = isPlant ? plant?.imageUrl : aquarium?.imageUrl;

  const [modalImgSrc, setModalImgSrc] = React.useState<string>(rawImageUrl || '');

  React.useEffect(() => {
    if (rawImageUrl) {
      setModalImgSrc(rawImageUrl);
    }
  }, [rawImageUrl]);

  // Close on Escape key and lock body scroll cleanly preserving prior overflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const prevOverflow = document.body.style.overflow;
    if (selected) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected, onClose]);

  if (!selected) return null;

  const title = isPlant ? plant!.title : aquarium!.title;
  const subtitle = isPlant ? plant!.botanicalName : `${aquarium!.dimensionsCm} • ${aquarium!.volumeLiters}L`;
  const price = isPlant ? plant!.price : aquarium!.price;
  const imageUrl = isPlant ? plant!.imageUrl : aquarium!.imageUrl;
  const description = isPlant ? plant!.description : aquarium!.description;
  const isInStock = isPlant ? plant!.isInStock : aquarium!.isInStock;
  const badge = isPlant ? plant!.badge : aquarium!.badge;

  const whatsAppUrl = isPlant
    ? buildWhatsAppPlantUrl({
        phone: STORE_INFO.whatsappPhone,
        title: plant!.title,
        botanicalName: plant!.botanicalName,
        potSize: plant!.potSize,
        price: plant!.price,
        isInStock: plant!.isInStock,
      })
    : buildWhatsAppAquariumUrl({
        phone: STORE_INFO.whatsappPhone,
        title: aquarium!.title,
        dimensionsCm: aquarium!.dimensionsCm,
        volumeLiters: aquarium!.volumeLiters,
        glassThicknessMm: aquarium!.glassThicknessMm,
        glassType: aquarium!.glassType,
        price: aquarium!.price,
        isInStock: aquarium!.isInStock,
      });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="item-detail-title"
          className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-nature-linen border border-stone-200/80 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-stone-700 shadow-md backdrop-blur-md hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Edge-to-Edge Hero Image Showcase */}
          <div
            onClick={() => onOpenPhotoZoom(modalImgSrc, title)}
            className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-stone-100 overflow-hidden flex-shrink-0 cursor-zoom-in group/img"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={modalImgSrc}
              alt={title}
              onError={() => {
                setModalImgSrc(
                  isPlant
                    ? 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80'
                    : 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80'
                );
              }}
              className="h-full w-full object-cover select-none transition-transform duration-500 group-hover/img:scale-105"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              {badge && (
                <span className="badge-green shadow-sm text-xs font-bold px-3 py-1 backdrop-blur-md">
                  {badge}
                </span>
              )}
              {isInStock ? (
                <span className="badge inline-flex items-center gap-1.5 bg-white/95 text-emerald-800 shadow-sm backdrop-blur-md font-semibold px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock &amp; Ready
                </span>
              ) : (
                <span className="badge-sold shadow-sm font-semibold px-3 py-1">
                  Sold Out / Custom Order
                </span>
              )}
            </div>

            {/* Full-Screen Zoom Button Overlay */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPhotoZoom(modalImgSrc, title);
              }}
              className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/65 px-3.5 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-md hover:bg-black/85 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Click to Zoom &amp; Inspect</span>
            </button>
          </div>

          {/* Right Column: Comprehensive Content & Conversion Details */}
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 sm:p-8">
            <div className="space-y-5">
              {/* Header: Title & Botanical / Dimension Subtitle */}
              <div>
                <span className="text-2xs font-bold uppercase tracking-widest text-nature-sage">
                  {isPlant ? 'Nursery Living Specimen' : 'Handcrafted Studio Aquarium'}
                </span>
                <h2 id="item-detail-title" className="font-display text-2xl sm:text-3xl font-bold text-nature-forest mt-1">
                  {title}
                </h2>
                <p className="text-sm italic text-nature-muted mt-0.5">
                  {subtitle}
                </p>
              </div>

              {/* Price Banner */}
              <div className="flex items-baseline justify-between rounded-2xl bg-white/80 border border-stone-200/60 p-4 shadow-2xs">
                <div>
                  <span className="text-2xs uppercase tracking-wider text-nature-muted font-medium">
                    Listed Studio Price
                  </span>
                  <p className="price-display text-3xl font-bold text-nature-forest">
                    ₹{price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" />
                    Zero Middleman Markups
                  </span>
                  <p className="text-2xs text-nature-muted mt-1">Direct Nursery Pickup / Padded Delivery</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-nature-forest mb-1.5">
                  About This Specimen
                </h4>
                <p className="text-xs sm:text-sm text-nature-stone/85 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Specs Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-nature-forest mb-2">
                  {isPlant ? 'Botanical Care Specifications' : 'Craftsmanship & Engineering'}
                </h4>

                {isPlant ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="spec-chip-plant p-2.5 rounded-xl">
                      <Sun className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Light Need</p>
                        <p className="text-xs font-semibold text-nature-forest">{plant!.lightRequirement}</p>
                      </div>
                    </div>

                    <div className="spec-chip-plant p-2.5 rounded-xl">
                      <Droplets className="h-4 w-4 text-sky-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Watering</p>
                        <p className="text-xs font-semibold text-nature-forest">{plant!.waterFrequency}</p>
                      </div>
                    </div>

                    <div className="spec-chip-plant p-2.5 rounded-xl">
                      <Box className="h-4 w-4 text-stone-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Pot Dimension</p>
                        <p className="text-xs font-semibold text-nature-forest">{plant!.potSize}</p>
                      </div>
                    </div>

                    <div className="spec-chip-plant p-2.5 rounded-xl">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Care Level</p>
                        <p className="text-xs font-semibold text-nature-forest">{plant!.difficultyLevel}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="spec-chip-aqua p-2.5 rounded-xl">
                      <ShieldCheck className="h-4 w-4 text-aqua-azure" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Glass Type</p>
                        <p className="text-xs font-semibold text-nature-forest">{aquarium!.glassThicknessMm}mm {aquarium!.glassType.split(' ')[0]}</p>
                      </div>
                    </div>

                    <div className="spec-chip-aqua p-2.5 rounded-xl">
                      <Droplet className="h-4 w-4 text-cyan-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Water Volume</p>
                        <p className="text-xs font-semibold text-nature-forest">{aquarium!.volumeLiters} Liters Capacity</p>
                      </div>
                    </div>

                    <div className="spec-chip-aqua p-2.5 rounded-xl">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Scaping Style</p>
                        <p className="text-xs font-semibold text-nature-forest">{aquarium!.style}</p>
                      </div>
                    </div>

                    <div className="spec-chip-aqua p-2.5 rounded-xl">
                      <Armchair className="h-4 w-4 text-amber-700" />
                      <div>
                        <p className="text-2xs text-nature-muted font-medium">Cabinet Status</p>
                        <p className="text-xs font-semibold text-nature-forest">{aquarium!.includesCabinet ? 'Cabinet Included' : 'Tank Only (Cabinet Extra)'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sensory Guidance Note */}
              {isPlant && (plant!.careTip || plant!.idealPlacement) && (
                <div className="rounded-2xl border border-emerald-200/80 bg-nature-leaf/50 p-3.5 space-y-1.5 text-xs text-nature-stone">
                  {plant!.careTip && (
                    <p className="flex items-start gap-2">
                      <Compass className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Botanist Advice:</strong> {plant!.careTip}</span>
                    </p>
                  )}
                  {plant!.idealPlacement && (
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>Ideal Room Position:</strong> {plant!.idealPlacement}</span>
                    </p>
                  )}
                </div>
              )}

              {!isPlant && (aquarium!.clarityRating || aquarium!.aquascapingTip) && (
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/50 p-3.5 space-y-1.5 text-xs text-nature-stone">
                  {aquarium!.clarityRating && (
                    <p className="flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                      <span><strong>Optical Clarity:</strong> {aquarium!.clarityRating}</span>
                    </p>
                  )}
                  {aquarium!.aquascapingTip && (
                    <p className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span><strong>Aquascaper’s Tip:</strong> {aquarium!.aquascapingTip}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions: High-Conversion WhatsApp CTA + Call Button */}
            <div className="pt-6 border-t border-stone-200/60 mt-6 space-y-3">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp rounded-2xl py-3.5 text-base shadow-whatsapp w-full"
              >
                <MessageCircle className="h-5 w-5" />
                <span>
                  {isInStock ? 'Inquire & Order on WhatsApp' : 'Inquire on Custom Build Quote'}
                </span>
              </a>

              <div className="flex items-center justify-between text-xs text-nature-muted px-1">
                <a
                  href={`tel:${STORE_INFO.callingPhone}`}
                  className="flex items-center gap-1.5 hover:text-nature-forest font-medium transition-colors"
                >
                  <Phone className="h-3.5 w-3.5 text-nature-moss" />
                  <span>Call {STORE_INFO.callingPhone}</span>
                </a>

                <span className="text-2xs text-stone-500">
                  Response within &lt;15 mins on WhatsApp
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
