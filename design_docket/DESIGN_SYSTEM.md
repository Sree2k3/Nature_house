# Biophilic Design System & UI Style Guide

**Project Name:** Nature House (Plant Nursery & Handcrafted Aquariums)  
**Document Version:** v1.0 (Finalized for Production Deployment)  
**Date:** October 19, 2026  
**Status:** Approved & Finalized for Deployment  
**Design Philosophy:** Organic Biophilic Aesthetics, Frosted Glassmorphism & High-Tactile Mobile Ergonomics  
**Scale Target:** Max 100–200 concurrent active users on the page  

---

## 1. Design Philosophy & Biophilic Foundations

Nature House is an immersive digital reflection of two living art forms: **botanical greenery** and **crystal-clear aquatic sceneries**.

The visual language avoids sterile e-commerce styling, harsh stark white backgrounds, and generic retail cards. Instead, it employs:
- **Warm Organic Textures:** Soothing warm linen backgrounds (`#fcfbf7`) that evoke sunlight filtering through plant leaves.
- **Translucent Glassmorphism:** Subtle, frosty backdrop blurs mimicking pristine low-iron aquarium glass panes.
- **Tactile Micro-Interactions:** Physics-based spring transitions (via Framer Motion) simulating natural organic movement.
- **High Information Density with Visual Simplicity:** Compact, glanceable care chips that replace bulky text paragraphs.

---

## 2. Color Palette & Semantic Tokens

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NATURE HOUSE COLOR SYSTEM                       │
├────────────────────┬───────────┬───────────────────────────────────────┤
│ TOKEN NAME         │ HEX CODE  │ SEMANTIC USAGE                        │
├────────────────────┼───────────┼───────────────────────────────────────┤
│ Linen Cream        │ #fcfbf7   │ Primary page background (light/soothe)│
│ Forest Canopy      │ #0f281e   │ Headings, primary brand text, buttons │
│ Botanical Emerald  │ #2d6a4f   │ Plant badges, secondary accents       │
│ Aquatic Azure      │ #0077b6   │ Aquarium badges, glass thickness tags │
│ Deep River Slate   │ #1e293b   │ High-contrast body copy and captions  │
│ Soft Leaf Mist     │ #e8f5e9   │ Plant chip background fills           │
│ Crystal Water Tint │ #e0f2fe   │ Aquarium chip background fills        │
│ WhatsApp Vibrant   │ #25d366   │ Primary conversion action button      │
│ Alert Amber        │ #f59e0b   │ Low stock / limited batch notice      │
│ Frosted Border     │ #e2e8f0   │ 1px subtle card outlines              │
└────────────────────┴───────────┴───────────────────────────────────────┘
```

### 2.1 Tailwind CSS Theme Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          linen: '#fcfbf7',
          forest: '#0f281e',
          moss: '#2d6a4f',
          leaf: '#e8f5e9',
          slate: '#1e293b',
          border: '#e7e5e4',
        },
        aqua: {
          deep: '#03045e',
          azure: '#0077b6',
          mist: '#e0f2fe',
          glass: 'rgba(255, 255, 255, 0.75)',
        },
        whatsapp: {
          green: '#25d366',
          hover: '#20ba5a',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'serif'],
      },
      boxShadow: {
        'soft-lift': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'glass-glow': '0 0 20px rgba(45, 106, 79, 0.12)',
        'aqua-glow': '0 0 20px rgba(0, 119, 182, 0.15)',
      }
    },
  },
  plugins: [],
};

export default config;
```

---

## 3. Typography Scale & Hierarchy

| Element | Font Family | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Store Name / Hero Title** | Playfair Display / Serif | 28px (Mobile) / 40px (Desktop) | Bold (700) | 1.15 | -0.02em |
| **Section Headings (H2)** | Plus Jakarta Sans | 20px (Mobile) / 26px (Desktop) | Bold (700) | 1.25 | -0.01em |
| **Card Title** | Plus Jakarta Sans | 17px | SemiBold (600)| 1.3 | Normal |
| **Botanical / Subtitle** | Plus Jakarta Sans | 13px | Italic / Regular | 1.4 | Normal |
| **Spec Chips Text** | Plus Jakarta Sans | 11.5px | Medium (500) | 1.2 | +0.01em |
| **Price Display** | Plus Jakarta Sans | 19px | Bold (700) | 1.0 | -0.01em |
| **WhatsApp CTA Text** | Plus Jakarta Sans | 14px | SemiBold (600)| 1.0 | +0.02em |

---

## 4. UI Component Anatomy & Design Standards

### 4.1 Real-Time Store Status Pill
- **Visual Design:** Floating rounded-full badge with subtle glass blur.
- **Open State (`09:00 - 20:30 IST`):**
  - Dot: `bg-emerald-500` with continuous subtle pulse (`animate-ping`).
  - Text: `🟢 Open Now • Closes at 8:30 PM`
- **Closed State:**
  - Dot: `bg-slate-400`
  - Text: `⚪ Closed • Opens Tomorrow at 9:00 AM`

### 4.2 Interactive Sliding Section Switcher
- **Container:** Rounded pill container with `bg-stone-200/60` and `p-1.5`.
- **Active Indicator:** Smooth white background slider with `shadow-sm` animated using Framer Motion layoutId:
```tsx
<motion.div
  layoutId="active-pill"
  className="absolute inset-0 bg-white rounded-full shadow-sm"
  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
/>
```

### 4.3 Plant Card Specification
```
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │ [📸 WebP Photo 4:3 with Subtle Hover Lift]      │ │
│ │ [🌿 Air Purifying]                [🟢 In Stock] │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Monstera Deliciosa                                  │
│ Swiss Cheese Tropical Foliage                       │
│                                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐  │
│ │ ☀️ Bright Indirect   │  │ 💧 1-2x Weekly       │  │
│ └──────────────────────┘  └──────────────────────┘  │
│ ┌──────────────────────┐  ┌──────────────────────┐  │
│ │ 📏 6-inch Pot        │  │ 🌿 Beginner Friendly │  │
│ └──────────────────────┘  └──────────────────────┘  │
│                                                     │
│ ₹350                                                │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │     💬 Inquire & Order on WhatsApp              │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 4.4 Aquarium Card Specification
```
┌─────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────┐ │
│ │ [📸 Crystal Glass Tank Photo 4:3]               │ │
│ │ [💎 Opti-White 10mm]          [Ready to Order]  │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ 3ft Rimless Aquascape Tank                          │
│ 90cm × 45cm × 45cm Setup (182 Liters)               │
│                                                     │
│ ┌──────────────────────┐  ┌──────────────────────┐  │
│ │ 🪟 10mm Low-Iron     │  │ 💧 182 Liters        │  │
│ └──────────────────────┘  └──────────────────────┘  │
│ ┌──────────────────────┐  ┌──────────────────────┐  │
│ │ 💎 Diamond Bevel     │  │ 🪵 Cabinet Ready     │  │
│ └──────────────────────┘  └──────────────────────┘  │
│                                                     │
│ ₹8,500                                              │
│ *Custom sizes and cabinets built on order           │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │     💬 Inquire / Customize via WhatsApp         │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 5. Mobile Ergonomics & Admin Touch Targets

### 5.1 One-Handed Nursery Usability
Nursery owners often operate their smartphones with one hand while holding a pot, water hose, or tools in the other:
- **Thumb Zone Compliance:** Key action buttons (WhatsApp, Add Card, Camera Upload, Stock Toggle) are positioned within the lower two-thirds of the screen.
- **Minimum Tap Target:** Every clickable element, button, and spec pill has a minimum interactive touch area of **48px × 48px**.
- **Visual Feedback:** All taps trigger immediate tactile visual feedback (`active:scale-95` transition) so the user is never left wondering if a tap registered.
