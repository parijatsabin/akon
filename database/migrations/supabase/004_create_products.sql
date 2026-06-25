-- ============================================================
-- Migration: 004_create_products
-- Provider:  Supabase (PostgreSQL)
-- Description: Product catalogue. Replaces the hardcoded
--   COLLECTION array in siteContent.ts / cms.defaults.ts.
--   Price stored as integer NPR (e.g. 24500 = NPR 24,500).
--   Fragrance notes stored as Postgres text arrays.
-- ============================================================

-- Collection category enum
CREATE TYPE product_collection AS ENUM (
    'Signature Collection',
    'Luxury Collection',
    'Limited Edition',
    'Seasonal Fragrances'
);

CREATE TABLE IF NOT EXISTS public.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL,
    name            TEXT NOT NULL,
    collection      product_collection NOT NULL,
    description     TEXT,

    -- Price as integer NPR. Display formatting is a frontend concern.
    -- e.g. 24500 renders as "NPR 24,500"
    price_npr       INTEGER NOT NULL CHECK (price_npr > 0),

    -- Optional badge: 'Best Seller', 'Limited Edition', 'New', etc.
    badge           TEXT,

    -- CSS accent color for the product card (hex string)
    accent_color    TEXT NOT NULL DEFAULT '#a27f3f',

    -- External URL or base64 data URI for future upload support
    image_url       TEXT NOT NULL DEFAULT '',

    -- URL to a product detail page (or '#' if not yet built)
    product_url     TEXT NOT NULL DEFAULT '#',

    -- Fragrance notes as arrays — no join table needed for this use case
    notes_top       TEXT[] NOT NULL DEFAULT '{}',
    notes_heart     TEXT[] NOT NULL DEFAULT '{}',
    notes_base      TEXT[] NOT NULL DEFAULT '{}',

    -- Display order in the collection grid (lower = first)
    sort_order      INTEGER NOT NULL DEFAULT 0,

    -- Soft delete / draft support
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT products_slug_unique UNIQUE (slug),
    CONSTRAINT products_name_nonempty CHECK (name <> ''),
    CONSTRAINT products_slug_nonempty CHECK (slug <> '')
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_collection  ON public.products(collection);
CREATE INDEX IF NOT EXISTS idx_products_is_active   ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order  ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON public.products(slug);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.products IS
    'Fragrance product catalogue. Replaces the hardcoded COLLECTION array.';
COMMENT ON COLUMN public.products.price_npr IS
    'Price in Nepali Rupees as integer. Frontend formats as "NPR X,XXX".';
COMMENT ON COLUMN public.products.notes_top IS
    'Top (opening) fragrance notes as text array, e.g. {Bergamot,"Pink Pepper"}';
COMMENT ON COLUMN public.products.sort_order IS
    'Admin-controlled display order. Lower numbers appear first.';
