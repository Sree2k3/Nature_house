'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CatalogSection } from '@/types/catalog';

interface SectionSwitcherProps {
  activeSection: CatalogSection;
  onSectionChange: (section: CatalogSection) => void;
  plantCount: number;
  aquariumCount: number;
}

export default function SectionSwitcher({
  activeSection,
  onSectionChange,
  plantCount,
  aquariumCount,
}: SectionSwitcherProps) {
  const tabs: { id: CatalogSection; label: string; icon: string; count: number }[] = [
    { id: 'plants', label: 'Nursery Plants', icon: '🌿', count: plantCount },
    { id: 'aquariums', label: 'Handcrafted Aquariums', icon: '🐟', count: aquariumCount },
  ];

  return (
    <div className="flex justify-center px-4">
      <div className="relative inline-flex items-center rounded-full bg-stone-200/70 p-1.5 shadow-inner border border-nature-border">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`relative z-10 flex items-center gap-2.5 rounded-full px-6 sm:px-8 py-3 text-sm sm:text-base font-bold transition-colors duration-200 cursor-pointer ${
                isActive ? 'text-nature-forest' : 'text-nature-muted hover:text-nature-stone'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-2xs font-bold transition-colors ${
                  isActive
                    ? tab.id === 'plants'
                      ? 'bg-nature-leaf text-nature-moss'
                      : 'bg-aqua-mist text-aqua-azure'
                    : 'bg-stone-300/60 text-stone-600'
                }`}
              >
                {tab.count}
              </span>

              {/* Framer Motion Spring Pill Slider */}
              {isActive && (
                <motion.div
                  layoutId="active-section-indicator"
                  className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm border border-stone-200/80"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
