-- ─────────────────────────────────────────────────────────
-- Nature House — PostgreSQL Master Schema (Supabase & PostgreSQL)
-- Document Reference: design_docket/DATABASE.md & TRD.md
-- Version: v1.0 (Production Master Schema)
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

-- 3. MEDIA ASSETS TABLE (Metadata for uploaded catalog images)
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_key TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    byte_size INT NOT NULL,
    width INT,
    height INT,
    checksum TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PLANTS TABLE
CREATE TABLE IF NOT EXISTS public.plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
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
    care_tip TEXT,
    ideal_placement TEXT,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. AQUARIUMS TABLE
CREATE TABLE IF NOT EXISTS public.aquariums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL,
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
    ideal_placement TEXT,
    clarity_rating TEXT,
    aquascaping_tip TEXT,
    is_in_stock BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SITE SETTINGS TABLE (Single-row store metadata, store hours, announcements)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ADMIN ACCOUNTS TABLE (Admin credentials & token invalidation ledger)
CREATE TABLE IF NOT EXISTS public.admin_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    token_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. MEDIA CLEANUP QUEUE (Durable background queue for orphaned media file deletion)
CREATE TABLE IF NOT EXISTS public.media_cleanup_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID,
    storage_key TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    processed_at TIMESTAMPTZ
);

-- 9. STORE NOTICES / SCHEDULE ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.store_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. MIGRATION LEDGER (Tracks applied migrations)
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    name TEXT PRIMARY KEY,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Mark baseline migrations as recorded
INSERT INTO public.schema_migrations (name) VALUES 
    ('001_initial_schema.sql'),
    ('002_admin_and_media.sql')
ON CONFLICT (name) DO NOTHING;

-- 11. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
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

DROP TRIGGER IF EXISTS set_admin_accounts_updated_at ON public.admin_accounts;
CREATE TRIGGER set_admin_accounts_updated_at
BEFORE UPDATE ON public.admin_accounts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_store_notices_updated_at ON public.store_notices;
CREATE TRIGGER set_store_notices_updated_at
BEFORE UPDATE ON public.store_notices
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 12. PERFORMANCE INDEXES (Optimized for concurrent catalog and query performance)
CREATE INDEX IF NOT EXISTS idx_categories_type_order ON public.categories (type, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_plants_catalog ON public.plants (is_in_stock, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plants_category ON public.plants (category_id);
CREATE INDEX IF NOT EXISTS idx_plants_media ON public.plants (media_id);
CREATE INDEX IF NOT EXISTS idx_aquariums_catalog ON public.aquariums (is_in_stock, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aquariums_category ON public.aquariums (category_id);
CREATE INDEX IF NOT EXISTS idx_aquariums_media ON public.aquariums (media_id);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_media_assets_storage_key ON public.media_assets (storage_key);
CREATE INDEX IF NOT EXISTS idx_media_cleanup_status ON public.media_cleanup_queue (status, attempts);
CREATE INDEX IF NOT EXISTS idx_store_notices_active ON public.store_notices (is_active, start_date, end_date);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES (Supabase Security Best Practice)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aquariums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_cleanup_queue ENABLE ROW LEVEL SECURITY;

-- Allow public read access to catalog and public business information
CREATE POLICY "Public categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public plants are viewable by everyone" ON public.plants FOR SELECT USING (true);
CREATE POLICY "Public aquariums are viewable by everyone" ON public.aquariums FOR SELECT USING (true);
CREATE POLICY "Public settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public media assets are viewable by everyone" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Public store notices are viewable by everyone" ON public.store_notices FOR SELECT USING (true);

-- Admin tables & cleanup queues are protected (Accessible only via backend connection pool or service role)
-- No public select policies are added for admin_accounts or media_cleanup_queue, keeping credentials fully private.
