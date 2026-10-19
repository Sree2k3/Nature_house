-- ─────────────────────────────────────────────────────────
-- Migration 002: Admin Accounts & Local Media Storage
-- ─────────────────────────────────────────────────────────

-- Admin Accounts Table (Persistent admin credentials)
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

CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON public.admin_accounts (LOWER(email));

-- Media Assets Table (Metadata for files in local media store)
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

CREATE INDEX IF NOT EXISTS idx_media_assets_storage_key ON public.media_assets (storage_key);

-- Media Cleanup Queue (Durable queue for orphaned media file deletion)
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

CREATE INDEX IF NOT EXISTS idx_media_cleanup_status ON public.media_cleanup_queue (status, attempts);

-- Add optional media_id foreign key references to plants and aquariums
ALTER TABLE public.plants ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL;
ALTER TABLE public.aquariums ADD COLUMN IF NOT EXISTS media_id UUID REFERENCES public.media_assets(id) ON DELETE SET NULL;
