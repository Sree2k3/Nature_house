'use client';

import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  accentColor?: 'nature' | 'aqua';
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onSelectCategory,
  accentColor = 'nature',
}: CategoryFilterProps) {
  return (
    <div className="flex w-full items-center justify-start sm:justify-center overflow-x-auto py-2 px-4 scrollbar-none gap-2">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`rounded-full px-5 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs ${
              isActive
                ? accentColor === 'nature'
                  ? 'bg-nature-forest text-nature-linen shadow-xs ring-1 ring-nature-forest'
                  : 'bg-aqua-azure text-white shadow-xs ring-1 ring-aqua-azure'
                : 'bg-white text-nature-stone border border-nature-border/90 hover:bg-stone-50 hover:border-nature-moss/40'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
