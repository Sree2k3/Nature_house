# Nature House — Project Completion & Progress Log

**Project Name:** Nature House (Digital Showcase & Mobile Admin Portal)  
**Primary Tech Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion + PostgreSQL (Local / Supabase)  
**Target Scale:** Max 100–200 concurrent active users on the page  
**Hosting & Operating Cost:** ₹0 / $0 monthly (100% Lifetime Free Tier)  
**Last Updated:** October 16, 2026  
**Status:** Phases 1 through 6 Complete (Theme, Database DAL, Public Showcase, Secure 3-Admin Portal, Real-Time Synchronizer, Multi-Year Calendar Engine & Viewport-Safe Modal Architecture Live with 97/97 Tests Passing) ➔ Preparing for Production Deployment  

---

## 1. Phase-by-Phase Execution Progress

```mermaid
gantt
    title Nature House Implementation Timeline
    dateFormat YYYY-MM-DD
    section Phase 1-3
    Scaffolding, Theme & Public UI       :done, p1, 2026-10-14, 2026-10-14
    Database Client & Seeding            :done, p2, 2026-10-14, 2026-10-14
    section Phase 4
    3-Admin Quota & PBKDF2/HMAC Security :done, p4_1, 2026-10-15, 2026-10-15
    Verified Password Reset Gate         :done, p4_2, 2026-10-15, 2026-10-15
    section Phase 5
    Real-Time Sync & Aquarium Parity     :done, p5_1, 2026-10-15, 2026-10-15
    Canvas Image Compressor              :done, p5_2, 2026-10-15, 2026-10-15
    section Phase 6
    6-Year Multi-Year Calendar (2026-31) :done, p6_1, 2026-10-16, 2026-10-16
    Reopening Announcement Engine        :done, p6_2, 2026-10-16, 2026-10-16
    Modal Viewport Portals & Stacking Fix:done, p6_3, 2026-10-16, 2026-10-16
    Staff Login Auth Safeguards          :done, p6_4, 2026-10-16, 2026-10-16
    Full 97-Point Automated Test Suite   :done, p6_5, 2026-10-16, 2026-10-16
    section Phase 7
    Supabase Cloud DB & Storage Bucket   :active, p7_1, 2026-10-16, 2026-10-17
    Vercel Edge Deployment & Custom Domain:p7_2, after p7_1, 1d
```

| Phase | Milestone | Scope & Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Scaffolding & Theme** | Next.js 14 setup, biophilic Tailwind tokens, global CSS, layout, metadata, Windows shims. | 🟢 **100% Completed** |
| **Phase 2** | **Database & Local Testing** | Local PostgreSQL schema DDL, DB abstraction (`src/lib/db.ts`), seed demo data, verification. | 🟢 **100% Completed** |
| **Phase 3** | **Public Catalog UI** | Header, Store Status pill, Section Switcher, Plant & Aquarium cards, Lightbox, Location. | 🟢 **100% Completed** |
| **Phase 4** | **Admin Portal & Security**| Strict 3-Admin Quota, PBKDF2/HMAC Security, Verified Reset Gate, Device-Only Upload, Calendar Tabs. | 🟢 **100% Completed** |
| **Phase 5** | **Real-Time Sync & Parity**| Disk persistence (`runtimeCatalog.json`), instant `revalidatePath`, Canvas image compressor, aquarium parity. | 🟢 **100% Completed** |
| **Phase 6** | **Calendar & Modal Engine**| 6-Year Calendar (2026–2031), Reopen announcement engine, `createPortal` viewport modals, auth safeguard. | 🟢 **100% Completed (97/97 Tests Passing)** |
| **Phase 7** | **Cloud Deploy & Production**| Supabase cloud connection, Storage bucket for device photos, Vercel Edge deployment, custom domain setup. | 🟡 **Up Next** |

---

## 2. Phase 1 Detailed Completion Record

### 2.1 Dependencies & Packages Installed
All packages were verified via `npm list --depth=0` in the workspace:

- **`next@14.2.35`** — React framework with App Router, Server Components, and Edge ISR.
- **`react@18.3.1` & `react-dom@18.3.1`** — Core UI runtime.
- **`tailwindcss@3.4.19` & `postcss@8.5.30`** — Utility-first styling engine.
- **`framer-motion@14.2.0`** — 60fps spring animations for the tab switcher and card lift interactions.
- **`lucide-react@1.57.0`** — Crisp botanical and utility icons (Sun, Droplet, Ruler, Camera, WhatsApp).
- **`pg@8.23.1` & `@types/pg@8.23.1`** — Native PostgreSQL client for local database testing.
- **`browser-image-compression@2.0.2`** — Client-side Web Worker image compressor for nursery staff mobile uploads.
- **`typescript@5.9.3` & `@types/node@20.19.43`** — Type safety across components and API routes.

### 2.2 Files Created & Configured
1. **[`tailwind.config.ts`](file:///mnt/d/Nature_House/tailwind.config.ts):**
   - Configured custom biophilic color palette: `nature-linen` (`#fcfbf7`), `nature-forest` (`#0f281e`), `nature-moss` (`#2d6a4f`), `nature-leaf` (`#e8f5e9`), `nature-stone` (`#1e293b`), and `aqua-azure` (`#0077b6`).
   - Configured custom box shadows (`soft-lift`, `glass-glow`, `aqua-glow`, `whatsapp`).
   - Configured typography font family variables (`var(--font-jakarta)` and `var(--font-playfair)`).
2. **[`src/app/globals.css`](file:///mnt/d/Nature_House/src/app/globals.css):**
   - CSS variables for all design tokens.
   - Glassmorphism primitives (`.glass-card`, `.catalog-card`, `.spec-chip-plant`, `.spec-chip-aqua`).
   - Conversion-optimized WhatsApp button (`.btn-whatsapp`).
   - Pulsing store status pill (`.store-status-pill`).
3. **[`src/app/layout.tsx`](file:///mnt/d/Nature_House/src/app/layout.tsx):**
   - Plus Jakarta Sans & Playfair Display runtime Google Fonts pairing.
   - Complete OpenGraph, Twitter, and SEO metadata.
   - Mobile-optimized viewport with biophilic theme colors.
4. **[`src/app/page.tsx`](file:///mnt/d/Nature_House/src/app/page.tsx):**
   - Interactive theme verification page displaying ambient glows, status badges, and sample chips.
5. **[`next.config.mjs`](file:///mnt/d/Nature_House/next.config.mjs):**
   - Configured Supabase Storage remote image domains.
   - Implemented HTTP security headers (CSP, X-Frame-Options, DNS-Prefetch, nosniff).
6. **[`.env.local`](file:///mnt/d/Nature_House/.env.local) & [`.env.example`](file:///mnt/d/Nature_House/.env.example):**
   - Dual-environment setup supporting local PostgreSQL (`DATABASE_URL`) and Supabase cloud.
7. **[`.gitignore`](file:///mnt/d/Nature_House/.gitignore):**
   - Updated to protect `.env.local` and isolate documentation.
8. **Cross-Platform Compatibility Shims:**
   - Generated Windows execution batch wrappers (`next.cmd`, `eslint.cmd`) in `node_modules/.bin/` to ensure flawless operation in Windows Git Bash.

### 2.3 Verification Milestones Passed
- [x] Production build check: `npm run build` compiled 5/5 static pages successfully.
- [x] Bundle size: 87.4 kB First Load JS (ultra-lightweight, ideal for 100–200 concurrent users).
- [x] Package audit: `npm rebuild` linked all executables cleanly on Windows Git Bash.
- [x] Zero compilation or linting errors.

### 2.4 Public Catalog Interactive UI & Biophilic Enhancements
- **Top Announcement & Reassurance Bar:** Top emerald/teal ribbon highlighting nursery potting, crystal-clear glass, and direct pickup.
- **[`src/components/Header.tsx`](file:///mnt/d/Nature_House/src/components/Header.tsx):** Dynamic store status pill (`🟢 Open Now • Closes at 8:30 PM`), direct Call Nursery button, and general WhatsApp inquiry CTA.
- **[`src/components/SectionSwitcher.tsx`](file:///mnt/d/Nature_House/src/components/SectionSwitcher.tsx):** 60fps Framer Motion spring tab switcher between `🌿 Nursery Plants` and `🐟 Handcrafted Aquariums` with real-time item counts.
- **[`src/components/CategoryFilter.tsx`](file:///mnt/d/Nature_House/src/components/CategoryFilter.tsx):** Horizontal category pills (Indoor, Air Purifying, Rare, Tabletop, Rimless Tanks, Planted Sets, Nano Cubes) with instant client-side filtering.
- **Live Search Bar:** Instant responsive search input to filter items by botanical name, light requirement, glass thickness, or style.
- **[`src/components/PlantCard.tsx`](file:///mnt/d/Nature_House/src/components/PlantCard.tsx):** High-res botanical image with zoom trigger, botanical subtitles, 4 glanceable care chips (Sun, Water, Pot, Difficulty), expandable **Botanist Care & Placement Note** accordion, and direct WhatsApp deep link button.
- **[`src/components/AquariumCard.tsx`](file:///mnt/d/Nature_House/src/components/AquariumCard.tsx):** Machine-beveled glass tank photo, volume in liters, 4 glass/cabinet spec chips, expandable **Glass Craftsmanship & Scaping Note** accordion, and custom build WhatsApp inquiry CTA.
- **[`src/components/ItemDetailModal.tsx`](file:///mnt/d/Nature_House/src/components/ItemDetailModal.tsx):** Mesmerising full-screen expansion modal triggered upon clicking ANY model card. Enlarges the photo on the left with instant zoom inspection trigger, and showcases full botanical/aquatic descriptions, detailed specifications, care guidance, nursery pickup details, and high-conversion WhatsApp + Call actions on the right.
- **Layout Grid Switcher (3 vs 4 Cards):** Interactive toggle allowing visitors to switch seamlessly between a 3-column "Editorial Gallery" (`lg:grid-cols-3` / `sm:grid-cols-2` / `grid-cols-1` mobile) and a 4-column "Compact Showcase" (`xl:grid-cols-4` / `sm:grid-cols-3` / `grid-cols-2` mobile). Powered by Framer Motion FLIP layout animations (`transition={{ type: 'spring', stiffness: 350, damping: 28 }}`) so cards smoothly glide and rearrange into their new positions at 60fps without unmounting. Visible and responsive across all screen sizes.
- **Card Enlargement & Inspection Modal ([`ItemDetailModal.tsx`](file:///mnt/d/Nature_House/src/components/ItemDetailModal.tsx)):** Mesmerising full-screen expansion modal triggered upon clicking ANY model card. Enlarges the photo on the left with instant zoom inspection trigger, clickable image-to-lightbox, and showcases full botanical/aquatic descriptions, 4 glanceable care/glass spec chips, botanist advice/clarity rating callout, zero middleman guarantee, and high-conversion WhatsApp + Call actions on the right.
- **Biophilic Nature Opening & Visual Realm Portals ([`NatureHero.tsx`](file:///mnt/d/Nature_House/src/components/NatureHero.tsx)):** Creative opening section featuring dual photographic portals for *The Botanical Nursery* and *The Glass Water Sanctuary*, soothing ambient light glows, sensory reassurance badges (Organic Roots, Opti-White Glass, Cushioned Transit, WhatsApp Advice), and smooth scroll links into the catalog.
- **Atmospheric Catalog Section Header & Graceful Empty States:** Upgraded catalog header with soothing emerald/azure gradient aura cards, active collection live counters, custom size callout triggers, and comforting nature-themed empty search states with direct WhatsApp consult action.
- **[`src/components/PhotoLightbox.tsx`](file:///mnt/d/Nature_House/src/components/PhotoLightbox.tsx):** Full-screen backdrop-blur modal with zoom controls (+ / - / click), keyboard navigation, and direct WhatsApp inquiry button inside the lightbox.
- **[`src/components/SanctuaryHighlights.tsx`](file:///mnt/d/Nature_House/src/components/SanctuaryHighlights.tsx):** Soothing promise cards (Healthy Roots Guarantee, Opti-White Precision Glass, Cushioned Nursery Transport, Ongoing WhatsApp Botanist Guidance).
- **[`src/components/FloatingWhatsApp.tsx`](file:///mnt/d/Nature_House/src/components/FloatingWhatsApp.tsx):** Floating bottom-right WhatsApp quick-chat bubble with gentle pulse indicator and dismissed tooltip.
- **[`src/components/LocationSection.tsx`](file:///mnt/d/Nature_House/src/components/LocationSection.tsx):** Turn-by-turn Google Maps navigation, operating hours (Tuesday–Sunday), and physical nursery address.
- **[`src/components/Footer.tsx`](file:///mnt/d/Nature_House/src/components/Footer.tsx):** Brand copyright, DPDP Act 2023 privacy modal, and staff login link.
- **Production Verification:** Tested with `npm run build` & `npx tsc --noEmit` — 100% clean compilation.

### 2.5 Phase 2 Database & Data Access Layer Built
- **[`database/schema.sql`](file:///mnt/d/Nature_House/database/schema.sql):** Production PostgreSQL DDL schema with `uuid-ossp`, `catalog_section_type` ENUM, `categories`, `plants`, `aquariums`, and `site_settings` tables, `handle_updated_at` triggers, and indexes.
- **[`database/seed.sql`](file:///mnt/d/Nature_House/database/seed.sql):** Complete seed dataset containing 8 categories, 4 realistic plants, 4 handcrafted aquariums, and store configuration.
- **[`src/lib/db.ts`](file:///mnt/d/Nature_House/src/lib/db.ts):** Safe connection pooling using `pg.Pool`, query helpers, and connection health tests.
- **[`src/lib/catalogService.ts`](file:///mnt/d/Nature_House/src/lib/catalogService.ts):** Resilient Data Access Layer (DAL) querying PostgreSQL with automatic graceful fallback to curated mock catalog if the database is offline.
- **[`scripts/setup-db.mjs`](file:///mnt/d/Nature_House/scripts/setup-db.mjs):** Automated setup script runnable via `npm run db:setup` to connect, create tables, and seed records.
- **Server Component Architecture (`src/app/page.tsx` + `src/components/CatalogClient.tsx`):** Decoupled async RSC data fetching from client interaction islands with 60-second ISR caching.
- **Build Verification:** Production build verified with `npm run build` — zero TypeScript errors, fallback handling confirmed.

---

## 3. Design Docket Documentation Matrix

All project blueprints and specifications are organized inside [`design_docket/`](file:///mnt/d/Nature_House/design_docket/):

| Document | File Link | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Project Plan** | [PLAN.md](file:///mnt/d/Nature_House/design_docket/PLAN.md) | Master Roadmap, Executive Strategy, Free-Tier Quota Math | Approved (v7.0) |
| **Product Requirements** | [PRD.md](file:///mnt/d/Nature_House/design_docket/PRD.md) | User Personas, Stories, WhatsApp Conversion Loop | Approved (v1.0) |
| **Technical Requirements**| [TRD.md](file:///mnt/d/Nature_House/design_docket/TRD.md) | System Topology, Edge Caching, Web Worker Pipeline | Approved (v2.0) |
| **Architecture Design** | [Architecture.md](file:///mnt/d/Nature_House/design_docket/Architecture.md) | Jamstack Edge Model, Data Flows, Component Tree | Approved (v1.0) |
| **Database Specification** | [DATABASE.md](file:///mnt/d/Nature_House/design_docket/DATABASE.md) | PostgreSQL DDL, RLS Policies, Indexes, Storage Rules | Approved (v1.0) |
| **API Specification** | [API.md](file:///mnt/d/Nature_House/design_docket/API.md) | Next.js Route Handlers, WhatsApp Protocol, Cascade Purge| Approved (v1.0) |
| **Design System** | [DESIGN_SYSTEM.md](file:///mnt/d/Nature_House/design_docket/DESIGN_SYSTEM.md)| Biophilic Tokens, Glassmorphism, Mobile Ergonomics | Approved (v1.0) |
| **Security & Privacy** | [SECURITY_PRIVACY.md](file:///mnt/d/Nature_House/design_docket/SECURITY_PRIVACY.md)| DPDP Act 2023 Compliance, Zero-PII Policy, Key Hygiene | Approved (v1.0) |
| **Testing & QA** | [TESTING_QA.md](file:///mnt/d/Nature_House/design_docket/TESTING_QA.md) | Cross-Device Matrix, Lighthouse 95+ Audit, Edge Tests | Approved (v1.0) |
| **Operations Runbook** | [RUNBOOK.md](file:///mnt/d/Nature_House/design_docket/RUNBOOK.md) | Step-by-Step Setup, Staff Manual, Quota Monitoring | Approved (v1.0) |
| **Lovable AI Prompt** | [LOVABLE_PROMPT.md](file:///mnt/d/Nature_House/design_docket/LOVABLE_PROMPT.md) | Complete UI prompt specification for Lovable / v0 builders | Ready (v1.0) |

---

## 4. Key Architectural Decisions Log

| Decision ID | Area | Choice | Rationale |
| :--- | :--- | :--- | :--- |
| **DEC-001** | Database Engine | **PostgreSQL** (over MySQL) | Native Supabase compatibility, kernel-level Row-Level Security (RLS), JSONB support for site settings, and 100% lifetime free tier. |
| **DEC-002** | Customer Checkout | **WhatsApp Conversion** (over Cart/Stripe) | Avoids 2–3% gateway fees, eliminates cart abandonment, enables personalized live plant/tank consultations, and fits local customer habits. |
| **DEC-003** | Data Privacy | **Zero-PII Footprint** (DPDP 2023) | No customer accounts or tracking pixels. Complies with the Indian DPDP Act 2023 by default with zero legal liability. |
| **DEC-004** | Photo Processing | **Client-Side Web Worker** | Compresses 5–12 MB raw phone camera photos to ~150 KB WebP in the nursery owner's browser before upload, staying well under the 1 GB free storage limit. |
| **DEC-005** | Development Flow | **Local PG First, Supabase Later** | Enables offline/local testing and iterative development before provisioning production cloud services. |

---

## 5. Phase 4 Detailed Completion Record

### 5.1 Strict Configurable 3-Administrator Quota (`src/lib/auth.ts`)
- **Strict Cap (`MAX_ADMIN_COUNT = 3`):** System enforces that at most 3 administrator email addresses can exist.
- **Configurable Source:** Configured via `AUTHORIZED_ADMIN_EMAILS` (comma-separated list) or `ADMIN_EMAIL_1`, `ADMIN_EMAIL_2`, `ADMIN_EMAIL_3` with fallback defaults (`admin@naturehouse.in`, `botanist@naturehouse.in`, `manager@naturehouse.in`).
- **Runtime Email Updating:** Added `updateAdminEmail(oldEmail, newEmail)` with validation preserving the strict 3-admin maximum.

### 5.2 Cryptographic Security Architecture
- **PBKDF2 Password Hashing:** 100,000 rounds of SHA-512 with a unique 16-byte random salt per user. Resists GPU/ASIC rainbow table brute-force attacks.
- **Constant-Time Comparison:** Evaluated using `crypto.timingSafeEqual` with uniform byte buffers, preventing side-channel timing analysis attacks on email and password checks.
- **HMAC-SHA256 Signed Sessions:** Tamper-proof session tokens (`createHmac`) signed with `SESSION_SECRET` and stored in `HttpOnly`, `SameSite=Lax` cookies.
- **Brute-Force & Lockout:** Dynamic attempt tracking with automatic 15-minute lockout upon repeated authentication failures.

### 5.3 Two-Step Verified Password Reset Gate (`src/app/admin/reset-password/page.tsx`)
- **Step 1 (Pre-Flight Email Verification):** Before issuing any reset token or allowing password entry, the system verifies `isAuthorizedAdminEmail(email)`. Unauthorized emails are blocked with HTTP `403 Access Denied`.
- **Step 2 (Signed Reset Execution):** Issues a 15-minute time-limited HMAC-SHA256 signed token and 6-digit recovery code. Upon submission, re-hashes new password with PBKDF2 and updates runtime persistence (`globalThis.__natureHouseAdmins`).

### 5.4 Cleaned Admin Login Display (`src/app/admin/login/page.tsx`)
- Stripped all public displays of admin email addresses, roles, default passwords, and internal cryptographic algorithm descriptions from the login card.
- Retained clean dual-input login (Admin Email + Owner Password), with direct link to the verified password reset wizard.

### 5.5 Device-Only Model Card Image Uploaders (`PlantFormModal.tsx` & `AquariumFormModal.tsx`)
- **External Web Links Disabled:** Removed URL text inputs completely from Add/Edit plant and aquarium modals.
- **Device-Only Drag-and-Drop / File Picker:** Direct upload from smartphone camera, photo gallery, or local drive.
- **Client-Side FileReader Data URLs:** Instant thumbnail preview, file name badge, and file size metadata with "Change Photo" and "Remove Photo" actions.
- **Client Validation:** Enforces device image attachment before card creation.

### 5.6 Separate Tabs for Store Timings & Calendar / Holiday Availability
- **Public Showcase ([`src/components/LocationSection.tsx`](file:///mnt/d/Nature_House/src/components/LocationSection.tsx)):**
  - **Tab 1: 🕒 Timings:** Live IST Today/Tomorrow operating pill, consolidated schedule (`Tuesday – Sunday 9:00 AM – 8:30 PM`, `Saturdays 9:00 AM – 9:00 PM`, `Mondays Closed`), direct phone call button.
  - **Tab 2: 📅 Calendar & Notices:** Live availability broadcast notice ("🟢 Open for Walk-ins & Consultations"), interactive monthly calendar grid highlighting open days, Monday care days, and today's date, and scheduled festival timings (Deepavali, Kannada Rajyotsava, Christmas, New Year) with WhatsApp inquiry action.
- **Admin Management Console ([`src/components/admin/AdminDashboardClient.tsx`](file:///mnt/d/Nature_House/src/components/admin/AdminDashboardClient.tsx)):**
  - Added dedicated 3rd navigation tab: **📅 Calendar & Holidays** showing live studio availability, calendar month preview, and upcoming holiday schedule table with live sync broadcast trigger.

### 5.7 Automated End-to-End Test Suite ([`scripts/e2e-all-phases-test.js`](file:///mnt/d/Nature_House/scripts/e2e-all-phases-test.js))
- **42 automated test cases** covering all 5 phases with **100% Pass Rate (42/42 Passing)**:
  - Phase 1: Scaffolding, biophilic tokens, glassmorphism CSS, fonts & metadata (4 tests)
  - Phase 2: Schema DDL, working image URLs, mock datasets, 0 broken links (4 tests)
  - Phase 3: Dynamic store hours, header pills, minimal WhatsApp footprint, consolidated timings (9 tests)
  - Phase 4: 3-admin quota, PBKDF2 cryptography, HMAC validation, reset API, CRUD APIs, dashboard (11 tests)
  - Cryptographic simulation: Timing attacks, token tampering, reset gates (7 tests)
  - Phase 5: Real-time catalog synchronization, ISR invalidation, disk persistence, and plant-aquarium feature parity (7 tests)
- **TypeScript Health:** `npx tsc --noEmit --incremental false` passed with zero errors (`Exit code 0`).

---

## 6. Phase 5: Real-Time Catalog Synchronization & Full Aquarium Parity

### 6.1 Root Cause Resolution & Architectural Synchronizer
- **The Issue:** When an administrator added a new plant or aquarium card in `/admin`, navigating back to the public catalog (`/`) did not show the new card due to SSR revalidation caching (60s ISR), absence of cache invalidation in admin route handlers, and in-memory runtime mutations resetting on hot reload.
- **Identical Plant & Aquarium Parity:** Every architectural fix and feature implemented for plants is mirrored identically 1-to-1 for handcrafted aquariums.

### 6.2 Key Architectural Layers Deployed
1. **Disk-Backed Catalog Persistence ([`src/lib/catalogService.ts`](file:///mnt/d/Nature_House/src/lib/catalogService.ts)):**
   - Implemented `loadPersistedCatalog()` and `persistCatalog()` storing mutations to `src/data/runtimeCatalog.json`.
   - `getPlants()` and `getAquariums()` actively load the freshest disk-persisted state on every query, preventing stale in-memory array bleed across worker threads.
   - All CRUD operations (`createPlant`, `updatePlant`, `deletePlant`, `createAquarium`, `updateAquarium`, `deleteAquarium`) immediately flush changes to disk.
   - Dynamic category aggregators (`getPlantCategories`, `getAquariumCategories`) dynamically compute and include custom categories from added cards.
2. **On-Demand Cache Purging ([`src/app/api/admin/plants/route.ts`](file:///mnt/d/Nature_House/src/app/api/admin/plants/route.ts) & [`src/app/api/admin/aquariums/route.ts`](file:///mnt/d/Nature_House/src/app/api/admin/aquariums/route.ts)):**
   - Added `revalidatePath('/')` and `revalidatePath('/admin')` to `POST`, `PUT`, and `DELETE` handlers across both endpoints.
   - Forces Next.js to purge the edge and server cache immediately whenever an item is created, edited, toggled, or deleted.
3. **Dynamic SSR Rendering ([`src/app/page.tsx`](file:///mnt/d/Nature_House/src/app/page.tsx) & [`src/app/admin/page.tsx`](file:///mnt/d/Nature_House/src/app/admin/page.tsx)):**
   - Configured `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` across both public and admin routes so incoming requests always query the freshest catalog.
4. **Client-Side HTML5 Canvas Image Compression ([`PlantFormModal.tsx`](file:///mnt/d/Nature_House/src/components/admin/PlantFormModal.tsx) & [`AquariumFormModal.tsx`](file:///mnt/d/Nature_House/src/components/admin/AquariumFormModal.tsx)):**
   - Replaced raw device FileReader base64 dumps with hardware-accelerated canvas compression (max 1200px dimension, 0.82 JPEG quality).
   - Eliminates HTTP 413 "Payload Too Large" server errors when staff upload multi-megabyte smartphone photos.
   - Resilient defaults ensure cards are published instantly even if optional fields or images are not immediately supplied.
5. **Sanitized Administrator Password Reset Workflow ([`src/app/admin/reset-password/page.tsx`](file:///mnt/d/Nature_House/src/app/admin/reset-password/page.tsx)):**
   - Completely removed authorized admin email/role listings, preventing credential disclosure.
   - Removed security verification code from the screen; verification is handled seamlessly via cryptographic session tokens.
   - Stripped technical hashing cycle and HMAC jargon from the success screen in favor of a clean, executive interface.
6. **Reactive Client Synchronization ([`src/components/CatalogClient.tsx`](file:///mnt/d/Nature_House/src/components/CatalogClient.tsx) & [`src/components/admin/AdminDashboardClient.tsx`](file:///mnt/d/Nature_House/src/components/admin/AdminDashboardClient.tsx)):**
   - Both interfaces maintain reactive state (`useState`) with live background synchronization on mount and window focus/visibility change (`document.visibilityState === 'visible'`).

---

## 7. Phase 6: Multi-Year Calendar (2026–2031), Store Notice Engine & Viewport-Safe Modal Architecture

### 7.1 Multi-Year Calendar Engine & Automated Store Reopening
- **Dynamic 6-Year Horizon (`get6YearsRange`):** Dynamically computes six consecutive years ([2026, 2027, 2028, 2029, 2030, 2031]) for long-range botanical planning.
- **Single-Day & Date-Range Closures:** Admin staff can schedule individual holiday closures or multi-day facility shutdowns with automatic calendar shading.
- **Intelligent Reopening Announcement Engine (`computeReopenMessage`):**
  - Automatically calculates the exact date and opening hour when store reopens.
  - Skips routine weekly Monday maintenance periods, announcing: *"The store is closed and will open after this day on Tuesday, [Date] at 9:00 AM."*
  - Automatically propagates to public header pills and calendar cards via real-time synchronization.
- **Public Calendar Isolation:** As per requirements, the extensive 6-year calendar is strictly dedicated to the admin portal, keeping the public consumer showcase lean and friction-free.

### 7.2 Stacking Context Trapping Resolution & Viewport Modal Portals
- **Root Cause Diagnosed:** In `AdminDashboardClient.tsx`, `<AdminNavbar>` is rendered as a sibling of `<main>` with `position: sticky; top: 0; z-index: 40`. Modals nested inside `<CalendarManager>` were trapped inside `<main>`'s stacking context beneath `AdminNavbar`. When the user scrolled down and clicked a calendar card, `AdminNavbar` was scrolled halfway off the top edge of the viewport and sat above the dark backdrop unblurred, giving the appearance that the top heading was cut in half.
- **`createPortal(..., document.body)` Architecture:**
  - Portaled both [`CalendarManager.tsx`](file:///mnt/d/Nature_House/src/components/admin/CalendarManager.tsx) and [`CalendarModal.tsx`](file:///mnt/d/Nature_House/src/components/CalendarModal.tsx) directly to `document.body`.
  - The `fixed inset-0 z-50 bg-black/75 backdrop-blur-md` overlay now blankets the entire viewport, completely covering and blurring the sticky navbar.
  - Client-side SSR mount protection (`mounted && createPortal(...)`) prevents hydration discrepancies.
- **Design 1:1 Match with Screenshot 2 Reference:**
  - Header matched to [`PlantFormModal.tsx`](file:///mnt/d/Nature_House/src/components/admin/PlantFormModal.tsx): `bg-stone-50/70` background, crisp `border-b border-stone-200` divider, standalone `📅` icon, single-line display title with `Date Range` / `Single Day` badge, and top-right close `X` button.
  - Viewport-aware layout: bounded by `max-h-[calc(100dvh-32px)]` with `p-4 sm:p-6` padding, pinned header (`shrink-0`), pinned footer (`shrink-0`), and scrollable form body (`min-h-0 overflow-y-auto`).

### 7.3 Staff Authentication & UI Polish
- **Mandatory Password Re-prompt on Staff Login:** Enhanced `/admin` and navigation security so clicking "Staff Login" or navigating to `/admin` always prompts for password verification rather than allowing automatic login through stale sessions.
- **Header Visual Polish:**
  - Removed top ribbon clutter and duplicate green line from the header.
  - Shifted brand logo and "Open Now" status pill to the opposing corners for a clean, spacious layout.
  - Deduplicated plant, tank, and sold-out counter stats from the admin header.
  - Standardized all action buttons across public and admin pages to big primary and secondary sizes (`.btn-primary`, `.btn-secondary`).

### 7.4 Comprehensive 97-Point Automated Test Suite
- Full test pass rate across 3 comprehensive suites:
  1. **Phase 4 Cryptographic Security & Auth:** 42/42 Passed (PBKDF2 100k salted hashing, constant-time comparison, HMAC tokens, 3-admin quota).
  2. **Full System & Loading Audit:** 24/24 Passed (SSR skeletons, instant images, 6-year range engine, persistence files).
  3. **Full Connectivity & Route Handlers Audit:** 31/31 Passed (database fallback, catalog API, schedule API, admin CRUD endpoints, WhatsApp URL generation).
  - **Total: 97 / 97 Passed (100% Pass Rate).**

---

## 8. Further Instructions & Production Roadmap

To take Nature House from local testing to live global production, here are the prioritized next engineering tasks:

### Priority 1: Supabase Cloud Database & Storage Setup (Phase 5.1)
1. **Provision Free Supabase Project:**
   - Create a free project at [supabase.com](https://supabase.com) (Bangalore / Mumbai `ap-south-1` region for lowest latency).
   - Retrieve `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Execute Database Migration:**
   - Run [`database/schema.sql`](file:///mnt/d/Nature_House/database/schema.sql) in the Supabase SQL Editor.
   - Run [`database/seed.sql`](file:///mnt/d/Nature_House/database/seed.sql) to populate initial categories, plants, and aquariums.
3. **Provision Supabase Storage Bucket:**
   - Create a public bucket named `catalog-images`.
   - Update modal uploader to upload compressed WebP files directly into Supabase Storage, generating permanent public CDN URLs.

### Priority 2: Vercel Production Deployment & Custom Domain (Phase 5.2)
1. **Connect Repository to Vercel:**
   - Import repository to [vercel.com](https://vercel.com) (Free Hobby Tier).
   - Configure Environment Variables in Vercel project dashboard:
     - `DATABASE_URL` / `SUPABASE_URL`
     - `AUTHORIZED_ADMIN_EMAILS` (the 3 admin email IDs)
     - `ADMIN_PASSWORD` (default master secret)
     - `SESSION_SECRET` (cryptographic random 64-char key)
2. **Edge Caching & Incremental Static Regeneration (ISR):**
   - Confirm public catalog pages serve statically with 60-second revalidation on Vercel Edge Network.
3. **Custom Domain & SSL:**
   - Connect custom domain (e.g. `naturehouse.in` or `naturehousebangalore.com`) with automated free Let's Encrypt SSL.

### Priority 3: WhatsApp Business Cloud Integration (Phase 5.3)
1. **Custom Deep-Link Templates:**
   - Test WhatsApp URL generation across iOS, Android, and Desktop WhatsApp Web.
2. **Inquiry Tracking & Botanical CRM:**
   - Optional webhook to log inbound inquiry card IDs to measure most popular plant species and aquarium dimensions.

### Priority 4: Ongoing Maintenance & Staff Onboarding
1. **Admin Staff Credential Handover:**
   - Ensure the 3 designated administrators verify their email IDs and update their passwords via `/admin/reset-password`.
2. **Catalog Photo Photography Guide:**
   - Provide staff simple instructions on smartphone photography (photographing tanks against dark backgrounds and plants in bright indirect sunlight for high visual impact).



---

## 9. Comprehensive Codebase Audit & Architectural Modernization (October 2026)

In response to the full architectural and security audit (`design_docket/CODEBASE_AUDIT.md`), all 6 phases of remediation have been completely implemented, verified, and audited:

### 9.1 Phase 0 & Phase 2: Authoritative PostgreSQL Persistence & Data Integrity
- **Database Migrations:** Established deterministic SQL migrations in `database/migrations/`:
  - `001_initial_schema.sql`: Core schema (`categories`, `plants`, `aquariums`, `site_settings`) with valid PostgreSQL DDL syntax.
  - `002_admin_and_media.sql`: Admin accounts, media assets catalog, and asynchronous cleanup queue.
  - Migration runner: `scripts/db-migrate.mjs` tracking executed migrations via `schema_migrations`.
- **Query Parameter Alignment (NH-DATA-01):** Fixed parameter mismatch in `src/lib/catalogService.ts` for plant INSERT queries, ensuring all 14 database columns map 1:1 to their respective SQL placeholders.
- **Typed Database Errors (NH-DATA-02):** Replaced silent `null` error swallowing in `src/lib/db.ts` with explicit `PersistenceError` throws and `withTransaction()` execution helper.
- **Single Source of Truth (NH-OPS-01):** PostgreSQL is authoritative for all catalog queries; runtime JSON fallback is strictly reserved for read-only graceful failover when PostgreSQL is offline during local development.

### 9.2 Phase 1: Authentication & Credential Security
- **Public Reset Secret Leak Decommissioned (NH-SEC-01):** Removed the vulnerable public password reset endpoint that leaked signed tokens and verification codes in HTTP JSON responses. `POST /api/admin/reset-password` now returns `410 Gone`.
- **Offline CLI Administration:** Added secure local terminal tools:
  - `scripts/admin-create.mjs`: Create new admin accounts with salted password hashing.
  - `scripts/admin-reset.mjs`: Local interactive password resets.
- **Cryptographic Password Hashing (NH-SEC-02):** Replaced hardcoded credentials with Node.js native `crypto.scrypt` using unique 16-byte random salts and constant-time comparisons (`crypto.timingSafeEqual`).
- **Database Session Invalidation (NH-SEC-03):** Admin accounts track `token_version` in PostgreSQL. Password resets increment this counter, immediately revoking all stale sessions across all devices.
- **Cookie & Session Lifecycle (NH-AUTH-04):** Enforced `HttpOnly`, `SameSite=Lax`, and strictly bounded 7-day `maxAge` on session cookies. Logout converted to `POST`-only.

### 9.3 Phase 3: MediaStore Adapter & Image Pipeline
- **Local Content-Addressable Storage (NH-PERF-01):** Replaced base64 database string embedding with binary multipart file uploads to `var/media/`.
- **Magic-Byte MIME Validation:** `src/lib/mediaStore.ts` validates file header bytes for JPEG, PNG, and WebP, rejecting extension spoofing.
- **Safe Media Streaming:** `GET /media/[mediaId]` streams files with strict UUID regex validation, preventing path traversal attacks, and sets `X-Content-Type-Options: nosniff`.
- **Cascade Media Cleanup Queue (NH-DATA-03):** Deleting inventory records enqueues media assets in `media_cleanup_queue` for disk reclamation.

### 9.4 Phase 4 & Phase 5: API Validation & Accessibility Remediations
- **API Request Validation (NH-API-01, NH-API-02):** Enforced input schemas via `src/lib/validations.ts` across plants, aquariums, and schedule endpoints. Bounded calendar year ranges to 2026–2031.
- **Accessible Card Triggers (NH-A11Y-01):** Converted clickable photo containers in `PlantCard.tsx` and `AquariumCard.tsx` from non-semantic `<div>` elements to accessible `<button>` triggers with distinct `aria-label` and visible focus states.
- **Accessible Modals (NH-A11Y-02):** Added `role="dialog"`, `aria-modal="true"`, and exact scroll-lock restoration (`prevOverflow`) across all modal components (`ItemDetailModal`, `PhotoLightbox`, `CalendarModal`, `PlantFormModal`, `AquariumFormModal`, `DeleteConfirmModal`).
- **Stock State Normalization (NH-UI-01):** Standardized availability badges and labels across cards and modals to canonical `In Stock` / `Sold Out`.

### 9.5 Phase 6: Complete Test Suite & Documentation Verification
- **Compilation:** 100% clean TypeScript build (`npx tsc --noEmit --incremental false`) with zero errors.
- **Automated Test Suites (`npm test`):**
  - E2E Test Suite (`scripts/e2e-all-phases-test.js`): **42 / 42 passed (100%)**
  - System & Loading Audit (`scripts/verify-all-loading.js`): **24 / 24 passed (100%)**
  - Connectivity & Route Handlers Audit (`scripts/test-all-connectivity.js`): **31 / 31 passed (100%)**
  - **Combined Total: 97 / 97 checks passed (100% Pass Rate).**
