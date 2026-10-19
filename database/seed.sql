-- ─────────────────────────────────────────────────────────
-- Nature House — Seed Data (Categories, Plants, Aquariums, Settings)
-- Reference baseline: Monstera Deliciosa, 3ft Rimless Aquascape Tank, photo-1522069169874-c58ec4b76be5
-- ─────────────────────────────────────────────────────────

-- Clean existing demo data (safe for initial dev)
TRUNCATE TABLE public.plants, public.aquariums, public.categories, public.site_settings CASCADE;

-- 1. INSERT CATEGORIES
INSERT INTO public.categories (id, name, slug, type, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Indoor Foliage', 'indoor-foliage', 'plant', 1),
('c2222222-2222-2222-2222-222222222222', 'Air Purifying', 'air-purifying', 'plant', 2),
('c3333333-3333-3333-3333-333333333333', 'Rare & Exotic', 'rare-exotic', 'plant', 3),
('c4444444-4444-4444-4444-444444444444', 'Low Maintenance', 'low-maintenance', 'plant', 4),
('c5555555-5555-5555-5555-555555555555', 'Rimless Ultra-Clear', 'rimless-ultra-clear', 'aquarium', 1),
('c6666666-6666-6666-6666-666666666666', 'Planted Sets', 'planted-sets', 'aquarium', 2),
('c7777777-7777-7777-7777-777777777777', 'Hardscape Terrariums', 'hardscape-terrariums', 'aquarium', 3),
('c8888888-8888-8888-8888-888888888888', 'Nano Cubes', 'nano-cubes', 'aquarium', 4);

-- 2. INSERT PLANTS (Curated exactly from pics/)
INSERT INTO public.plants (
    id, category_id, title, botanical_name, description, price,
    image_url, storage_path, light_requirement, water_frequency,
    pot_size, difficulty_level, badge, is_in_stock, is_featured, sort_order
) VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'c2222222-2222-2222-2222-222222222222',
    'Futura Superba Snake Plant',
    'Sansevieria trifasciata ''Futura Superba''',
    'Compact architectural foliage featuring broad, silver-green leaves with luminous golden-yellow margins. Celebrated by NASA studies for oxygen release throughout the night.',
    390.00,
    '/pics/snake-plant.webp',
    'plants/snake-plant.webp',
    'Low to Bright Indirect',
    'Every 2–3 Weeks',
    '5-inch Nursery Pot',
    'Beginner',
    '💨 Night Oxygen',
    true,
    true,
    1
),
(
    'b2222222-2222-2222-2222-222222222222',
    'c1111111-1111-1111-1111-111111111111',
    'Golden Money Plant',
    'Epipremnum aureum',
    'Lush cascading heart-shaped leaves marbled with radiant sunny gold and emerald tones. Cherished in Vastu and Feng Shui principles for inviting vitality and prosperity.',
    280.00,
    '/pics/golden-money-plant.webp',
    'plants/golden-money-plant.webp',
    'Medium Indirect to Shade',
    '1x Weekly',
    '5-inch Hanging / Table Pot',
    'Beginner',
    '🌿 Vastu Harmony',
    true,
    true,
    2
),
(
    'b3333333-3333-3333-3333-333333333333',
    'c4444444-4444-4444-4444-444444444444',
    'Potted Desert Cactus',
    'Echinopsis calochlora',
    'Sculptural ribbed desert succulent potted in mineral-rich volcanic pumice and porous clay grit. Perfectly acclimatized for warm, sunny balconies across West Bengal.',
    350.00,
    '/pics/cactus-potted.webp',
    'plants/cactus-potted.webp',
    'Bright Direct to Filtered',
    'Every 3–4 Weeks',
    '4-inch Terracotta Planter',
    'Beginner',
    '☀️ Drought Hardy',
    true,
    false,
    3
),
(
    'b4444444-4444-4444-4444-444444444444',
    'c3333333-3333-3333-3333-333333333333',
    'Miniature Garden Rose',
    'Rosa chinensis minima',
    'Ever-blooming compact rose specimen producing delicate, scented crimson blossoms. Nurtured in nutrient-dense organic vermicompost.',
    450.00,
    '/pics/rose.webp',
    'plants/rose.webp',
    '4–6 Hours Direct Sun',
    'Every 2 Days',
    '6-inch Nursery Planter',
    'Moderate',
    '🌹 Studio Fragrance',
    true,
    true,
    4
);

-- 3. INSERT AQUARIUMS (Strictly 6 items)
INSERT INTO public.aquariums (
    id, category_id, title, glass_type, glass_thickness_mm,
    dimensions_cm, volume_liters, description, price, image_url,
    storage_path, style, includes_cabinet, badge, is_in_stock, is_featured, sort_order
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'c5555555-5555-5555-5555-555555555555',
    '3ft Rimless Opti-White Tank',
    'Opti-White Ultra-Clear',
    10.0,
    '90 × 45 × 45 cm',
    182.0,
    'Handcrafted ultra-clear low-iron glass tank assembled with German high-tensile clear silicone seams and 45° diamond-beveled edges for an invisible aquatic boundary.',
    8500.00,
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=900&q=80',
    'aquariums/tank-90p.webp',
    'Rimless Nature Aquarium',
    false,
    '💎 Best Seller',
    true,
    true,
    1
),
(
    'a2222222-2222-2222-2222-222222222222',
    'c8888888-8888-8888-8888-888888888888',
    'Nano Desktop Cube 30C',
    'Low-Iron Opti-White',
    6.0,
    '30 × 30 × 30 cm',
    27.0,
    'Tranquil miniature water garden tailored for executive desks and quiet nightstands. Perfect for delicate Neocaridina shrimp and lush Anubias nana petite.',
    2400.00,
    'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=900&q=80',
    'aquariums/cube-30c.webp',
    'Nano Cube Iwagumi',
    false,
    '🦐 Nano Sanctuary',
    true,
    false,
    2
),
(
    'a3333333-3333-3333-3333-333333333333',
    'c6666666-6666-6666-6666-666666666666',
    '4ft Panoramic Planted Tank & Cabinet',
    'Opti-White Machine-Beveled',
    12.0,
    '120 × 50 × 50 cm',
    300.0,
    'Flagship showcase tank paired with a water-resistant matte black aluminum-framed cabinet. Includes soft-close hinges, internal sump routing, and leveling feet.',
    24500.00,
    'https://images.unsplash.com/photo-1535591273668-578e31182c4f?auto=format&fit=crop&w=900&q=80',
    'aquariums/tank-120p.webp',
    'Dutch Style Planted',
    true,
    '🪵 Cabinet Included',
    true,
    true,
    3
),
(
    'a4444444-4444-4444-4444-444444444444',
    'c7777777-7777-7777-7777-777777777777',
    'Dragon Stone Riverbed Scape Tank',
    'Low-Iron Clear Glass',
    8.0,
    '60 × 35 × 35 cm',
    73.0,
    'Pre-assembled natural hardscape featuring hand-chiseled aged Dragon Stone formations and Malaysian spiderwood pinned on fine cosmetic quartz river sand.',
    6800.00,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'aquariums/scape-60p.webp',
    'Artisan Hardscape',
    false,
    '🪨 Artisan Hardscape',
    true,
    false,
    4
),
(
    'a5555555-5555-5555-5555-555555555555',
    'c5555555-5555-5555-5555-555555555555',
    '2ft Shallow Bonsai Riparium Tank',
    'Opti-White Low-Iron',
    8.0,
    '60 × 40 × 25 cm',
    60.0,
    'Shallow rimless profile designed for emergent bog plants, terrestrial mosses, and floating red-root floaters viewed from top and side angles.',
    4900.00,
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=900&q=80',
    'aquariums/riparium-60.webp',
    'Shallow Riparium Scape',
    false,
    '🌾 Shallow Scape',
    true,
    false,
    5
),
(
    'a6666666-6666-6666-6666-666666666666',
    'c8888888-8888-8888-8888-888888888888',
    'Mini 20C Desktop Zen Cube',
    'Opti-White Beveled Glass',
    5.0,
    '20 × 20 × 20 cm',
    8.0,
    'Delicate miniature zen cube. Ideal for marimo moss balls, small freshwater snails, and calming meditation desks.',
    1450.00,
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
    'aquariums/cube-20c.webp',
    'Zen Moss Cube',
    false,
    '🧘 Zen Desk',
    true,
    false,
    6
);

-- 4. INSERT SITE SETTINGS
INSERT INTO public.site_settings (key, value) VALUES (
    'business_info',
    '{
        "store_name": "Nature House",
        "tagline": "A perfect place for nature lovers...",
        "whatsapp_phone": "+917908340234",
        "calling_phone": "+918293378711",
        "address_line1": "Nature House, Ashram Para",
        "address_line2": "Near East Rly Cabin, Adra, Purulia",
        "city": "Adra",
        "pincode": "723121",
        "google_maps_url": "https://maps.app.goo.gl/jo8HbjBLH6dxLjpDA?g_st=aw",
        "open_time": "09:00",
        "close_time": "20:30",
        "open_days": "Monday - Saturday (Closed Sundays)"
    }'::jsonb
);
