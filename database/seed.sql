-- ─────────────────────────────────────────────────────────
-- Nature House — Seed Data (Categories, Plants, Aquariums, Settings)
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

-- 2. INSERT PLANTS
INSERT INTO public.plants (
    id, category_id, title, botanical_name, description, price,
    image_url, storage_path, light_requirement, water_frequency,
    pot_size, difficulty_level, badge, is_in_stock, is_featured, sort_order
) VALUES
(
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Monstera Deliciosa',
    'Swiss Cheese Tropical Foliage',
    'Iconic split-leaf tropical vine. Thrives in moderate indirect light, bringing an architectural jungle presence to living spaces.',
    450.00,
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    'plants/monstera-deliciosa.webp',
    'Bright Indirect',
    '1x Weekly',
    '6-inch Nursery Pot',
    'Beginner',
    '🌿 Popular',
    true,
    true,
    1
),
(
    'b2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'Snake Plant Laurentii',
    'Sansevieria Trifasciata',
    'Gold-edged sword leaves that actively release oxygen at night and filter indoor airborne toxins. Tolerates neglect.',
    320.00,
    'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
    'plants/snake-plant.webp',
    'Low to Bright',
    'Every 2 Weeks',
    '5-inch Pot',
    'Beginner',
    '💨 Air Purifying',
    true,
    false,
    2
),
(
    'b3333333-3333-3333-3333-333333333333',
    'c1111111-1111-1111-1111-111111111111',
    'Fiddle Leaf Fig',
    'Ficus Lyrata',
    'Dramatic violin-shaped leathery leaves that serve as a stunning floor statement. Grown in well-drained organic nursery soil.',
    1250.00,
    'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=900&q=80',
    'plants/fiddle-leaf.webp',
    'Bright Filtered',
    'When topsoil is dry',
    '8-inch Ceramic Ready',
    'Moderate',
    '✨ Statement',
    true,
    true,
    3
),
(
    'b4444444-4444-4444-4444-444444444444',
    'c3333333-3333-3333-3333-333333333333',
    'Philodendron Pink Princess',
    'Philodendron Erubescens Variegata',
    'Rare variegated indoor climber with deep burgundy leaves splashed with vibrant bubblegum-pink patches.',
    1850.00,
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80',
    'plants/pink-princess.webp',
    'Medium-High Indirect',
    '2x Weekly Misting',
    '6-inch Moss Pole',
    'Moderate',
    '💎 Rare Collector',
    false,
    false,
    4
);

-- 3. INSERT AQUARIUMS
INSERT INTO public.aquariums (
    id, category_id, title, glass_type, glass_thickness_mm,
    dimensions_cm, volume_liters, description, price, image_url,
    storage_path, style, includes_cabinet, badge, is_in_stock, is_featured, sort_order
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'c5555555-5555-5555-5555-555555555555',
    '3ft Rimless Aquascape Tank',
    'Opti-White Ultra-Clear',
    10.0,
    '90 × 45 × 45 cm',
    182.0,
    'Handcrafted ultra-clear low-iron glass tank. Assembled with German high-tensile clear silicone seams and 45° diamond-beveled edges.',
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
    'Compact rimless cube tailored for executive desks, bedside tables, and planted shrimp biotope setups.',
    2400.00,
    'https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=900&q=80',
    'aquariums/cube-30c.webp',
    'Nano Cube Iwagumi',
    false,
    '🦐 Nano Setup',
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
    'Flagship showcase tank paired with a water-resistant matte black aluminum-framed cabinet. Includes leveling mat and inlet cutouts.',
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
    'Dragon Stone Riverbed Scape',
    'Low-Iron Clear Glass',
    8.0,
    '60 × 35 × 35 cm',
    73.0,
    'Pre-assembled natural hardscape featuring aged Dragon Stone formations and Malaysian driftwood pinned on cosmetic river sand.',
    6800.00,
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'aquariums/scape-60p.webp',
    'Hardscape Aquascape',
    false,
    '🪨 Artisan Hardscape',
    false,
    false,
    4
);

-- 4. INSERT SITE SETTINGS
INSERT INTO public.site_settings (key, value) VALUES (
    'business_info',
    '{
        "store_name": "Nature House",
        "tagline": "Living Greenery & Handcrafted Aquariums",
        "whatsapp_phone": "+919876543210",
        "calling_phone": "+919876543210",
        "address_line1": "Nature House Studio, 42 Green Avenue",
        "address_line2": "Near Ulsoor Lake Promenade",
        "city": "Bangalore",
        "pincode": "560042",
        "google_maps_url": "https://maps.google.com/?q=Bangalore+Plant+Nursery",
        "open_time": "09:00",
        "close_time": "20:30",
        "open_days": "Tuesday - Sunday (Closed Mondays)"
    }'::jsonb
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
