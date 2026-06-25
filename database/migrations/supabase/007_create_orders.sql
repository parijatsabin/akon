-- ============================================================
-- Migration: 007_create_orders
-- Provider:  Supabase (PostgreSQL)
-- Description: E-commerce orders and order line items.
--   Guest checkout: customer_id is NULL — user is redirected
--   to WhatsApp instead (handled in frontend/Worker).
--   Logged-in customers complete checkout in-app.
-- ============================================================

-- Order status lifecycle enum
CREATE TYPE order_status AS ENUM (
    'pending',      -- created, awaiting payment confirmation
    'confirmed',    -- payment confirmed by admin
    'processing',   -- being prepared / packed
    'shipped',      -- dispatched to customer
    'delivered',    -- received by customer
    'cancelled',    -- cancelled before shipment
    'refunded'      -- refund processed
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Human-readable order number shown to customers
    -- Format: ANOK-YYYY-NNNNN (e.g. ANOK-2026-00001)
    order_number        TEXT NOT NULL,

    -- NULL for WhatsApp/guest orders (no account required)
    customer_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    status              order_status NOT NULL DEFAULT 'pending',

    -- All amounts in integer NPR
    subtotal_npr        INTEGER NOT NULL CHECK (subtotal_npr >= 0),
    shipping_npr        INTEGER NOT NULL DEFAULT 0 CHECK (shipping_npr >= 0),
    discount_npr        INTEGER NOT NULL DEFAULT 0 CHECK (discount_npr >= 0),
    total_npr           INTEGER NOT NULL CHECK (total_npr >= 0),

    -- Shipping address snapshot (denormalized — address can change later)
    shipping_address    JSONB NOT NULL DEFAULT '{}'::JSONB,

    -- Optional order note from customer
    notes               TEXT,

    -- Admin notes (internal only)
    admin_notes         TEXT,

    -- Timestamps
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at        TIMESTAMPTZ,
    shipped_at          TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,

    CONSTRAINT orders_order_number_unique UNIQUE (order_number),
    CONSTRAINT orders_total_valid CHECK (
        total_npr = subtotal_npr + shipping_npr - discount_npr
    )
);

-- ── Order number sequence generator ──────────────────────────
-- Generates ANOK-YYYY-NNNNN format automatically
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN 'ANOK-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
        || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
END;
$$;

-- ── Order Items ───────────────────────────────────────────────
-- Line items snapshot prices at order time — product prices can
-- change later but this order is immutable once placed.
CREATE TABLE IF NOT EXISTS public.order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES public.products(id) ON DELETE SET NULL,

    -- Snapshots: captured at order time, never change
    product_name        TEXT NOT NULL,
    product_slug        TEXT NOT NULL,
    collection          TEXT NOT NULL,
    image_url           TEXT NOT NULL DEFAULT '',
    unit_price_npr      INTEGER NOT NULL CHECK (unit_price_npr > 0),

    quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total_npr      INTEGER NOT NULL CHECK (line_total_npr > 0),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT order_items_line_total_valid CHECK (
        line_total_npr = unit_price_npr * quantity
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id   ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number  ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON public.order_items(product_id);

-- Auto-update updated_at on orders
CREATE OR REPLACE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.orders IS
    'Customer orders. customer_id is NULL for WhatsApp/guest inquiries.';
COMMENT ON COLUMN public.orders.order_number IS
    'Human-readable ID shown to customers. Format: ANOK-YYYY-NNNNN';
COMMENT ON COLUMN public.orders.shipping_address IS
    'Snapshot of the shipping address at order time. '
    'Keys: full_name, phone, address_line1, address_line2, city, district, country.';
COMMENT ON TABLE public.order_items IS
    'Line items for each order. Prices are snapshots — immutable after creation.';
