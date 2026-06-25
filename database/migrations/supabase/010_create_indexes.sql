-- ============================================================
-- Migration: 010_create_indexes
-- Provider:  Supabase (PostgreSQL)
-- Description: Additional composite and full-text search indexes.
--   Core single-column indexes are defined in their respective
--   table migrations. This file adds cross-cutting query indexes.
-- ============================================================

-- ── Full-text search on products ─────────────────────────────
-- Allows searching by name, description, and collection
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(name, '')), 'A') ||
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(description, '')), 'B') ||
        SETWEIGHT(TO_TSVECTOR('english', COALESCE(collection::TEXT, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search
    ON public.products USING GIN(search_vector);

-- ── Composite index: active products ordered by sort ─────────
-- Powers the main GET /api/products query
CREATE INDEX IF NOT EXISTS idx_products_active_sorted
    ON public.products(is_active, sort_order)
    WHERE is_active = TRUE;

-- ── Composite index: customer orders by status ───────────────
-- Powers admin order list filtered by status + date
CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON public.orders(status, created_at DESC);

-- ── Composite index: customer's orders ───────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_customer_created
    ON public.orders(customer_id, created_at DESC)
    WHERE customer_id IS NOT NULL;

-- ── Full-text search on site_content ─────────────────────────
-- Allows admin to search content sections
CREATE INDEX IF NOT EXISTS idx_site_content_gin
    ON public.site_content USING GIN(content jsonb_path_ops);
