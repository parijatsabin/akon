-- ============================================================
-- Migration: 005_create_testimonials
-- Provider:  Supabase (PostgreSQL)
-- Description: Customer testimonials/reviews displayed on site.
--   Replaces the hardcoded TESTIMONIALS array.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
    id              SERIAL PRIMARY KEY,
    quote           TEXT NOT NULL,
    author_name     TEXT NOT NULL,
    author_title    TEXT,               -- e.g. "CEO of Alpha Company"
    rating          SMALLINT NOT NULL DEFAULT 5,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT testimonials_rating_range CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT testimonials_quote_nonempty CHECK (quote <> ''),
    CONSTRAINT testimonials_author_nonempty CHECK (author_name <> '')
);

CREATE INDEX IF NOT EXISTS idx_testimonials_is_visible  ON public.testimonials(is_visible);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order  ON public.testimonials(sort_order);

CREATE OR REPLACE TRIGGER testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.testimonials IS
    'Customer reviews shown in the Testimonials section. '
    'Managed via /admin/testimonials.';
