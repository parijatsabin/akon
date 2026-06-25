-- ============================================================
-- Migration: 003_to_009_schema
-- Provider:  PostgreSQL (standalone)
-- Description: All remaining tables — identical structure to
--   Supabase migrations 003–009 but references public.users
--   instead of public.profiles / auth.users.
--   No RLS (handled at application/Worker layer instead).
-- ============================================================

-- ── product_collection enum ───────────────────────────────────
CREATE TYPE product_collection AS ENUM (
    'Signature Collection', 'Luxury Collection',
    'Limited Edition', 'Seasonal Fragrances'
);

-- ── order_status enum ─────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
    'pending','confirmed','processing','shipped',
    'delivered','cancelled','refunded'
);

-- ── site_content ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_content (
    id          SERIAL PRIMARY KEY,
    section     TEXT NOT NULL,
    content     JSONB NOT NULL DEFAULT '{}'::JSONB,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT site_content_section_unique UNIQUE (section),
    CONSTRAINT site_content_section_nonempty CHECK (section <> '')
);
CREATE INDEX IF NOT EXISTS idx_site_content_section ON public.site_content(section);
CREATE INDEX IF NOT EXISTS idx_site_content_gin ON public.site_content USING GIN(content jsonb_path_ops);
CREATE OR REPLACE TRIGGER site_content_updated_at
    BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL,
    name            TEXT NOT NULL,
    collection      product_collection NOT NULL,
    description     TEXT,
    price_npr       INTEGER NOT NULL CHECK (price_npr > 0),
    badge           TEXT,
    accent_color    TEXT NOT NULL DEFAULT '#a27f3f',
    image_url       TEXT NOT NULL DEFAULT '',
    product_url     TEXT NOT NULL DEFAULT '#',
    notes_top       TEXT[] NOT NULL DEFAULT '{}',
    notes_heart     TEXT[] NOT NULL DEFAULT '{}',
    notes_base      TEXT[] NOT NULL DEFAULT '{}',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT products_slug_unique UNIQUE (slug),
    CONSTRAINT products_name_nonempty CHECK (name <> ''),
    CONSTRAINT products_slug_nonempty CHECK (slug <> '')
);
CREATE INDEX IF NOT EXISTS idx_products_collection    ON public.products(collection);
CREATE INDEX IF NOT EXISTS idx_products_is_active     ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order    ON public.products(sort_order);
CREATE INDEX IF NOT EXISTS idx_products_active_sorted ON public.products(is_active, sort_order) WHERE is_active = TRUE;
CREATE OR REPLACE TRIGGER products_updated_at
    BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── testimonials ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
    id          SERIAL PRIMARY KEY,
    quote       TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_title TEXT,
    rating      SMALLINT NOT NULL DEFAULT 5,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT testimonials_rating_range   CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT testimonials_quote_nonempty CHECK (quote <> ''),
    CONSTRAINT testimonials_author_nonempty CHECK (author_name <> '')
);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_visible ON public.testimonials(is_visible);
CREATE OR REPLACE TRIGGER testimonials_updated_at
    BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── newsletter_subscribers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT NOT NULL,
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    unsubscribed_at TIMESTAMPTZ,
    ip_address      TEXT,
    user_agent      TEXT,
    CONSTRAINT newsletter_email_unique  UNIQUE (email),
    CONSTRAINT newsletter_email_format  CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON public.newsletter_subscribers(is_active);

-- ── orders ────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
    RETURN 'ANOK-' || EXTRACT(YEAR FROM NOW())::TEXT || '-'
        || LPAD(NEXTVAL('order_number_seq')::TEXT, 5, '0');
END;
$$;

CREATE TABLE IF NOT EXISTS public.orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        TEXT NOT NULL,
    customer_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status              order_status NOT NULL DEFAULT 'pending',
    subtotal_npr        INTEGER NOT NULL CHECK (subtotal_npr >= 0),
    shipping_npr        INTEGER NOT NULL DEFAULT 0 CHECK (shipping_npr >= 0),
    discount_npr        INTEGER NOT NULL DEFAULT 0 CHECK (discount_npr >= 0),
    total_npr           INTEGER NOT NULL CHECK (total_npr >= 0),
    shipping_address    JSONB NOT NULL DEFAULT '{}'::JSONB,
    notes               TEXT,
    admin_notes         TEXT,
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
CREATE INDEX IF NOT EXISTS idx_orders_customer_id   ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON public.orders(created_at DESC);
CREATE OR REPLACE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── order_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name    TEXT NOT NULL,
    product_slug    TEXT NOT NULL,
    collection      TEXT NOT NULL,
    image_url       TEXT NOT NULL DEFAULT '',
    unit_price_npr  INTEGER NOT NULL CHECK (unit_price_npr > 0),
    quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    line_total_npr  INTEGER NOT NULL CHECK (line_total_npr > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT order_items_line_total_valid CHECK (
        line_total_npr = unit_price_npr * quantity
    )
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON public.order_items(product_id);

-- ── customer_addresses ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_single_default_address()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.customer_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id <> NEW.id AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    label           TEXT NOT NULL DEFAULT 'Home',
    full_name       TEXT NOT NULL,
    phone           TEXT NOT NULL,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    city            TEXT NOT NULL,
    district        TEXT,
    province        TEXT,
    country         TEXT NOT NULL DEFAULT 'Nepal',
    postal_code     TEXT,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT addresses_full_name_nonempty CHECK (full_name <> ''),
    CONSTRAINT addresses_city_nonempty      CHECK (city <> ''),
    CONSTRAINT addresses_line1_nonempty     CHECK (address_line1 <> '')
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default_per_user
    ON public.customer_addresses(user_id) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.customer_addresses(user_id);
CREATE OR REPLACE TRIGGER addresses_enforce_single_default
    BEFORE INSERT OR UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION public.enforce_single_default_address();
CREATE OR REPLACE TRIGGER addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── migration_history ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.migration_history (
    id                  SERIAL PRIMARY KEY,
    migration_name      TEXT NOT NULL,
    version             TEXT NOT NULL,
    executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    execution_time_ms   INTEGER,
    database_provider   TEXT NOT NULL,
    status              TEXT NOT NULL,
    checksum            TEXT NOT NULL,
    error_message       TEXT,
    rolled_back_at      TIMESTAMPTZ,
    CONSTRAINT migration_history_status_valid CHECK (
        status IN ('success', 'failed', 'rolled_back')
    ),
    CONSTRAINT migration_history_provider_valid CHECK (
        database_provider IN ('supabase', 'postgres', 'mysql')
    ),
    CONSTRAINT migration_history_no_duplicate UNIQUE (
        migration_name, database_provider, status
    )
);
