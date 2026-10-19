'use client';

import React from 'react';
import { HeartHandshake, Sparkles, ShieldCheck, Truck } from 'lucide-react';

export default function SanctuaryHighlights() {
  const highlights = [
    {
      icon: <Sparkles className="h-6 w-6 text-emerald-600" />,
      title: 'Healthy Roots Guarantee',
      desc: 'Each specimen is propagated in organic bio-rich nursery bark and inspected for vigorous white roots before listing.',
      bg: 'bg-emerald-50/70 border-emerald-100',
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-aqua-azure" />,
      title: 'Opti-White Precision Glass',
      desc: 'Machine-beveled 45° edges and German high-tensile silicone seams with zero bubble defects, backed by a 3-year leak warranty.',
      bg: 'bg-sky-50/70 border-sky-100',
    },
    {
      icon: <Truck className="h-6 w-6 text-amber-700" />,
      title: 'Cushioned Vehicle Delivery',
      desc: 'We never ship live foliage or glass tanks via rough couriers. Orders travel via dedicated, cushioned nursery transport across Adra and West Bengal.',
      bg: 'bg-amber-50/70 border-amber-100',
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-nature-moss" />,
      title: 'Ongoing Botanist Guidance',
      desc: 'Have a yellow leaf or algae question? Simply message our team on WhatsApp anytime for personalized care tips.',
      bg: 'bg-stone-50/70 border-stone-200/80',
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-nature-border/50 bg-stone-50/40">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-nature-sage mb-2">
            The Nature House Promise
          </p>
          <h2 className="section-heading text-3xl sm:text-4xl text-nature-forest">
            Crafted with Patience. Delivered with Care.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-nature-muted">
            We operate as an artisanal studio, not a high-volume warehouse. Every plant and glass tank receives hands-on craftsmanship.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border p-6 transition-all duration-300 hover:shadow-soft-lift hover:-translate-y-1 ${item.bg}`}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                {item.icon}
              </div>
              <h3 className="font-display text-base font-bold text-nature-forest mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-nature-stone/80 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
