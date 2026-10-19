-- ─────────────────────────────────────────────────────────
-- Nature House — PostgreSQL Schema (Local & Supabase Compatible)
-- Document Reference: design_docket/DATABASE.md
-- ─────────────────────────────────────────────────────────

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM FOR SECTION TYPES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'catalog_section_type') THEN
        CREATE TYPE catalog_section_type AS ENUM ('plant', 'aquarium');
    END IF;
END$$;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type catalog_section_type NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PLANTS TABLE
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    botanical_name TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL DEFAULT '',
    light_requirement TEXT NOT NULL DEFAULT 'Bright Indirect',
    water_frequency TEXT NOT NULL DEFAULT '1-2x Weekly',
    pot_size TEXT NOT NULL DEFAULT '6-inch Pot',
    difficulty_level TEXT NOT NULL DEFAULT 'Beginner',
    badge TEXT,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AQUARIUMS TABLE
CREATE TABLE IF NOT EXISTS public.aquariums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    glass_type TEXT NOT NULL DEFAULT 'Opti-White Ultra-Clear',
    glass_thickness_mm NUMERIC(4, 1) NOT NULL DEFAULT 10.0,
    dimensions_cm TEXT NOT NULL,
    volume_liters NUMERIC(6, 1) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL DEFAULT '',
    style TEXT NOT NULL DEFAULT 'Rimless Nature Aquarium',
    includes_cabinet BOOLEAN NOT NULL DEFAULT false,
    badge TEXT,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SITE SETTINGS TABLE (Single-row store metadata)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS set_plants_updated_at ON public.plants;
CREATE TRIGGER set_plants_updated_at
BEFORE UPDATE ON public.plants
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_aquariums_updated_at ON public.aquariums;
CREATE TRIGGER set_aquariums_updated_at
BEFORE UPDATE ON public.aquariums
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. PERFORMANCE INDEXES (Optimized for 100-200 concurrent users)
CREATE INDEX IF NOT EXISTS idx_categories_type_order ON public.categories (type, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_plants_catalog ON public.plants (is_in_stock, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plants_category ON public.plants (category_id);
CREATE INDEX IF NOT EXISTS idx_aquariums_catalog ON public.aquariums (is_in_stock, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aquariums_category ON public.aquariums (category_id);

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog items
CREATE POLICY IF NOT EXISTS "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public plants are viewable by everyone" ON public.plants FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public aquariums are viewable by everyone" ON public.aquariums FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
