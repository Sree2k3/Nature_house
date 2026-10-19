# Nature House — Complete Lovable / AI Prompt Specification

Use this exact prompt in **Lovable.dev** (or **v0.dev** / **Cursor**) to build the complete **Nature House** digital showcase and catalog with high-fidelity biophilic styling, 60fps spring transitions, 3 vs 4 card layout switching, and click-to-enlarge modal inspection.

---

```markdown
Build a modern, soothing, and high-conversion web application called "Nature House" — a digital showcase for an upscale tropical plant nursery and handcrafted opti-white glass aquarium studio based in Bangalore.

The design philosophy is "Biophilic Luxury": organic, calming, clean, and mesmerizing, evoking the sensation of walking through a sunlit botanical greenhouse and quiet crystal-clear aquascaping gallery.

---

### 1. CORE ARCHITECTURE & USER CONVERSION GOAL
- **No Complex Cart/Checkout:** Customers do not buy through a traditional cart. Instead, every interaction is engineered for direct 1-tap "Browse ➔ WhatsApp Consultation & Order" conversions and physical nursery visits.
- **WhatsApp Deep-Linking:** All WhatsApp CTA buttons must dynamically construct `https://wa.me/{phone}?text={encodedText}` with friendly pre-filled text mentioning the exact plant name, botanical name, pot size, price, or aquarium dimensions, glass thickness, and volume.
- **Lightweight & High Performance:** Fast loading (<1s), 60fps animations using Framer Motion, and mobile-first responsiveness.

---

### 2. DESIGN SYSTEM & COLOR TOKENS
Use Tailwind CSS with the following custom palette:
- **Backgrounds:**
  - `nature-linen`: `#fcfbf7` (warm organic off-white linen background)
  - `nature-leaf`: `#e8f5e9` (soft pale mint for plant spec chips)
  - `aqua-mist`: `#e0f2fe` (crystal water tint for aquarium spec chips)
- **Forest & Accents:**
  - `nature-forest`: `#0f281e` (deep botanical evergreen for headings & primary buttons)
  - `nature-moss`: `#2d6a4f` (rich sage green for accents, hover states, and highlights)
  - `nature-sage`: `#52836f` (mid-tone herbal green)
  - `aqua-azure`: `#0077b6` (vibrant ocean blue for aquarium highlights)
  - `nature-stone`: `#1e293b` (slate charcoal for readable body copy)
  - `nature-muted`: `#78716c` (warm stone gray for subtitles & secondary labels)
- **Conversion Colors:**
  - `whatsapp`: `#25d366` (official WhatsApp green) with hover `#20ba5a` and soft drop-shadow `rgba(37, 211, 102, 0.35)`
- **Typography:**
  - Serif Display font for all Headings: 'Playfair Display', Georgia, serif
  - Sans-serif Clean font for Body & UI: 'Plus Jakarta Sans', system-ui, sans-serif
  - Monospace font for dimensions & specs: 'Consolas', 'JetBrains Mono', monospace
- **Surfaces & Glassmorphism:**
  - Glass cards with `backdrop-blur-md bg-white/85 border border-stone-200/70 shadow-[0_10px_30px_-15px_rgba(45,106,79,0.08)]`
  - Subtle ambient radial gradients on the page background (soft emerald and sky blue glows).

---

### 3. COMPLETE UI COMPONENT BREAKDOWN

#### A. Top Ribbon & Sticky Header (`Header.tsx`)
1. **Top Announcement Ribbon:** Soft emerald banner highlighting: "🌿 Nursery Potting & Handcrafted Opti-White Tanks • Direct Bangalore Pickup & Padded Delivery • Zero Middleman Markup".
2. **Main Header:**
   - Nature House Logo with a delicate leaf/droplet emblem and title in Playfair Display.
   - **Dynamic Live Store Status Pill:** Shows a pulsing green dot `🟢 Open Now • Closes at 8:30 PM` (calculates based on current Bangalore IST time: 9:00 AM – 8:30 PM, Tue–Sun; displays "🔴 Opens Tomorrow at 9:00 AM" when closed).
   - Quick header actions: "Call Nursery" button and "WhatsApp Consultation" button.

#### B. Soothing Hero Section
- Subtle ambient glowing background gradients.
- Pill badge: "✨ Living Art For Modern Sanctuaries".
- Hero Title: "Nurtured Tropical Plants & Handcrafted Glass Aquascapes".
- Subtitle: "Welcome to Nature House. Tap any specimen or tank card to enlarge its full photo, botanist care specs, and dimensions. Inquire directly with one tap on WhatsApp."
- Two primary CTAs: "Inquire / Consult on WhatsApp" (green with WhatsApp icon) and "Visit Bangalore Nursery" (white pill with map pin icon linking to #location).
- 3 sensory reassurance badges:
  - 🌿 "Root-Inspected Greenery"
  - 🌊 "Opti-White 45° Beveled Tanks"
  - 💬 "Direct Nursery Response <15 mins"

#### C. Interactive Navigation, Filter & Grid Layout Switcher
1. **Section Switcher Pill:**
   - 60fps sliding spring tab pill toggling between:
     - `🌿 Fresh Nursery Plants (N)`
     - `🐟 Handcrafted Aquariums (N)`
2. **Category Filter Scroll:**
   - Horizontal pill bar with active/inactive states:
     - For Plants: "All Plants", "Indoor Foliage", "Air Purifying", "Rare & Exotic", "Low Light", "Tabletop Bonsai".
     - For Aquariums: "All Aquariums", "Rimless Nano Cubes", "Opti-White Cabinets", "Planted Nature Aquascapes", "Paludarium Terrariums".
3. **Live Search Bar & 3 vs 4 Card Switcher Row:**
   - Left: Rounded search input with search icon and clear (X) button ("Search plants, light, foliage..." or "Search tanks, glass, volume...").
   - Right: **Responsive Grid Switcher Toggle** with icons (`Grid3X3` and `LayoutGrid`):
     - Button 1: "3 Cards" (Editorial Gallery layout: 1 column on mobile, 2 columns on tablet, 3 columns on desktop).
     - Button 2: "4 Cards" (Compact Showcase layout: 2 columns on mobile, 3 columns on tablet, 4 columns on desktop).
   - **CRITICAL ANIMATION REQUIREMENT:** When switching between 3 Cards and 4 Cards, do NOT remount or flicker the grid. Use Framer Motion's FLIP `layout` prop (`transition={{ type: 'spring', stiffness: 350, damping: 28 }}`) so cards smoothly glide and rearrange into their new grid coordinates at 60fps!

#### D. Specimen Cards (`PlantCard.tsx` & `AquariumCard.tsx`)
Each card is clickable to open the Enlargement Modal (`onClick={onSelect}`):
1. **Photo Header (4:3 ratio):**
   - High-res photo with smooth hover zoom (`group-hover:scale-108 transition-transform duration-700`).
   - Badges overlay: Stock status ("Nursery Ready" with pulse dot or "Sold Out") and badge chip ("Best Seller", "Rare Find", "Ultra-Clear 45°").
   - Zoom Lightbox trigger icon in bottom-right corner (`e.stopPropagation()` to open full-screen lightbox).
   - Center hover pill: "Enlarge & View Specs ↗".
2. **Content Body:**
   - Title in Playfair Display serif font.
   - Italic botanical name (e.g., *Monstera deliciosa*) or tank dimension/volume subtitle.
   - 2-line clamped description.
   - **4 Glanceable Spec Chips (2x2 grid):**
     - For Plants: Light Requirement (Sun), Water Frequency (Droplets), Pot Size (Box), Difficulty Level (Sparkles).
     - For Aquariums: Glass Thickness & Type (ShieldCheck), Water Volume (Droplet), Scaping Style (Layers), Cabinet Status (Armchair).
3. **Card Footer:**
   - Price display in Indian Rupees (e.g., `₹1,250` or `₹18,500`) with "Live Specimen" or "Studio Handcrafted" badge.
   - High-contrast WhatsApp CTA button: "Inquire on WhatsApp" (`e.stopPropagation()` so it opens WhatsApp directly without opening the modal).

#### E. Mesmerizing Card Enlargement Modal (`ItemDetailModal.tsx`)
When the user clicks ANY model card, open an edge-to-edge modal with spring zoom animation (`initial={{ opacity: 0, scale: 0.92, y: 24 }}`):
1. **Modal Layout:**
   - Backdrop: Dark frosted glass (`bg-black/75 backdrop-blur-md`).
   - Split Card (`max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-nature-linen`):
     - **Left Column (Desktop 50% / Mobile Top):** Full image presentation. Clicking anywhere on the photo triggers the full-screen zoom lightbox. Includes "Click to Zoom & Inspect" button and stock status badge.
     - **Right Column (Desktop 50% / Mobile Scrollable Body):**
       - Specimen category badge ("Nursery Living Specimen" or "Handcrafted Studio Aquarium").
       - Main Title & Botanical Subtitle.
       - Price Card: Large `₹XX,XXX` price + "Zero Middleman Markups" green reassurance badge + "Direct Nursery Pickup / Padded Delivery".
       - "About This Specimen" full narrative description.
       - "Botanical Care Specifications" or "Craftsmanship & Engineering" with 4 detailed spec cards.
       - **Sensory Guidance Callout Box:**
         - For plants: Green tinted box with "Botanist Advice" (e.g. soil blend, misting) and "Ideal Room Position" (e.g. East-facing window).
         - For aquariums: Blue tinted box with "Optical Clarity Rating" (e.g. 91% light transmittance) and "Aquascaper’s Tip" (e.g. low-iron glass cleaning instructions).
       - **High-Conversion CTAs:**
         - Prominent green button: "Inquire & Order on WhatsApp" with pre-filled message.
         - Secondary row: "Call Nursery" phone link + "<15 mins response on WhatsApp" guarantee.
   - Floating circular close button (X) in top-right, plus close on `Escape` key and outside click.

#### F. Pure Photo Zoom Lightbox (`PhotoLightbox.tsx`)
- Full-screen dark lightbox with high-resolution image.
- Zoom in / Zoom out / Reset controls.
- Click to toggle zoom (1x to 2.2x).
- Direct "Inquire on WhatsApp" button within the lightbox so users inspecting details can convert immediately.

#### G. Sanctuary Highlights & Quality Guarantees (`SanctuaryHighlights.tsx`)
A grid of 4 trust-building cards:
1. 🌿 **Healthy Root Guarantee:** 7-day nursery acclimatization guarantee with free botanical replacement if plants fail to thrive.
2. 🔬 **Opti-White 45° Mitered Precision:** German Dow Corning silicone and 91%+ ultra-clear low-iron glass with zero green edge tint.
3. 📦 **Padded Safe Delivery:** Multi-layered bubble and thermocol packaging across Bangalore or direct pickup at our HSR layout greenhouse.
4. 👨‍🌾 **Ongoing WhatsApp Care Support:** Direct photo diagnoses from our resident botanists for the lifetime of your plant or aquarium.

#### H. Physical Nursery Location & Timings (`LocationSection.tsx`)
- Nursery banner with address: "Nature House Sanctuary, 24th Main Road, HSR Layout Sector 2, Bangalore, Karnataka 560102".
- Operating hours breakdown: Tuesday – Sunday: 9:00 AM – 8:30 PM (Mondays closed for maintenance).
- Embedded interactive Google Map iframe or preview card.
- "Get Turn-by-Turn Directions" button opening Google Maps.

#### I. Floating WhatsApp Quick-Chat (`FloatingWhatsApp.tsx`)
- Fixed at bottom-right corner (`z-40`).
- Pulsing green WhatsApp icon with subtle ping animation.
- Dismissible floating tooltip: "Chat with our Botanist & Aquascaper".

#### J. Footer (`Footer.tsx`)
- Brand statement, nursery links, copyright notice.
- Privacy & DPDP Act 2023 modal link ("Zero-PII Nursery Catalog: We do not track you or sell personal data").
- Private staff link to `/admin`.

---

### 4. DATA TYPES & SAMPLE DATA MODEL

Define TypeScript types:
```ts
export interface PlantItem {
  id: string;
  title: string;
  botanicalName: string;
  category: string;
  price: number;
  imageUrl: string;
  lightRequirement: string;
  waterFrequency: string;
  potSize: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Connoisseur';
  description: string;
  careTip: string;
  idealPlacement: string;
  isInStock: boolean;
  badge?: string;
}

export interface AquariumItem {
  id: string;
  title: string;
  category: string;
  dimensionsCm: string;
  volumeLiters: number;
  glassThicknessMm: number;
  glassType: string;
  price: number;
  imageUrl: string;
  style: string;
  includesCabinet: boolean;
  description: string;
  clarityRating: string;
  aquascapingTip: string;
  isInStock: boolean;
  badge?: string;
}
```

Include at least 4 sample plants:
1. **Monstera Deliciosa (Swiss Cheese Plant)** — ₹1,450, Bright Indirect Light, Weekly watering, 8-inch terracotta, Beginner.
2. **Fiddle Leaf Fig (Ficus Lyrata)** — ₹2,200, Filtered Sunlight, Water when top 2 inches dry, 10-inch ceramic, Intermediate.
3. **Calathea Orbifolia (Prayer Plant)** — ₹980, Medium Shaded Light, High humidity misting, 6-inch nursery pot, Intermediate.
4. **Bonsai Ficus Microcarpa** — ₹3,600, Direct Morning Sun, Twice weekly, Shallow oval ceramic, Connoisseur.

Include at least 4 sample aquariums:
1. **Opti-White Nano Cube 30P** — ₹4,800, 30x30x30 cm, 27 Liters, 5mm Low-Iron Opti-White, Rimless, Tank Only.
2. **Nature Scape 60P Studio Edition** — ₹14,500, 60x30x36 cm, 64 Liters, 6mm 45° Mitered Bevel, Tank Only.
3. **Aquascapers Grand 90P with Teak Cabinet** — ₹38,000, 90x45x45 cm, 182 Liters, 10mm German Dow Corning Silicone, Cabinet Included.
4. **Zen Shallow Riverbed 45S** — ₹6,200, 45x27x20 cm, 24 Liters, 5mm Ultra-Clear, Tank Only.

---

### 5. WHATSAPP URL BUILDER LOGIC
Implement helper functions:
```ts
export function buildWhatsAppPlantUrl(params: {
  phone: string;
  title: string;
  botanicalName: string;
  potSize: string;
  price: number;
  isInStock: boolean;
}): string {
  const cleanPhone = (params.phone || '919876543210').replace(/[^0-9]/g, '');
  const text = `🌿 *Nature House Inquiry — Plant Specimen*\n\n` +
    `Hello! I am inquiring about:\n` +
    `• *Plant:* ${params.title} (${params.botanicalName})\n` +
    `• *Pot Size:* ${params.potSize}\n` +
    `• *Listed Price:* ₹${params.price.toLocaleString('en-IN')}\n` +
    `• *Status:* ${params.isInStock ? 'In Stock' : 'Checking Restock'}\n\n` +
    `Could you please share live photos of current nursery specimens and confirm delivery to my location?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppAquariumUrl(params: {
  phone: string;
  title: string;
  dimensionsCm: string;
  volumeLiters: number;
  glassThicknessMm: number;
  glassType: string;
  price: number;
  isInStock: boolean;
}): string {
  const cleanPhone = (params.phone || '919876543210').replace(/[^0-9]/g, '');
  const text = `🐟 *Nature House Inquiry — Handcrafted Aquarium*\n\n` +
    `Hello! I am interested in this custom tank:\n` +
    `• *Model:* ${params.title}\n` +
    `• *Dimensions:* ${params.dimensionsCm}\n` +
    `• *Volume:* ${params.volumeLiters} Liters\n` +
    `• *Glass:* ${params.glassThicknessMm}mm ${params.glassType}\n` +
    `• *Listed Price:* ₹${params.price.toLocaleString('en-IN')}\n\n` +
    `I would like to inquire about glass joints, custom cabinet options, and safe padded delivery.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
```

Ensure all components render smoothly without any console errors, with delightful 60fps spring transitions, high-conversion WhatsApp links, and fully responsive behavior on both smartphone and wide desktop screens.
```
