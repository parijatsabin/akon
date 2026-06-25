-- ============================================================
-- Migration: 003_create_site_content
-- Provider:  Supabase (PostgreSQL)
-- Description: CMS content table. Replaces localStorage.
--   One row per named section (brand, hero, stats, about, etc.)
--   Content stored as JSONB — same shape as current cms.types.ts
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_content (
    id              SERIAL PRIMARY KEY,
    section         TEXT NOT NULL,
    content         JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    CONSTRAINT site_content_section_unique UNIQUE (section),
    CONSTRAINT site_content_section_nonempty CHECK (section <> '')
);

-- Fast lookup by section name (the primary access pattern)
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section);

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER site_content_updated_at
    BEFORE UPDATE ON public.site_content
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.site_content IS
    'CMS content sections. Each row is one named section of the website. '
    'Content JSONB mirrors the SiteData TypeScript interface shape.';
COMMENT ON COLUMN public.site_content.section IS
    'Section key: brand | hero | stats | about | commitment | newsletter | navigation | footer';
COMMENT ON COLUMN public.site_content.content IS
    'JSONB payload. Shape matches the corresponding TypeScript interface in cms.types.ts';
COMMENT ON COLUMN public.site_content.updated_by IS
    'Profile ID of the admin who last saved this section. NULL if seeded.';
