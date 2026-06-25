-- ============================================================
-- Migration: 011_create_rls_policies
-- Provider:  Supabase ONLY (Row Level Security)
-- Description: RLS policies for all public tables.
--   Supabase enforces these on every query.
--   Rule: anon can read public content. Customers own their data.
--   Admins have full access via service_role key (bypasses RLS).
-- ============================================================

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_history       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: is_admin() — checks if the calling user is an admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND user_type = 'admin'
          AND is_active = TRUE
    );
$$;

-- ============================================================
-- profiles
-- ============================================================
-- Users can read and update their own profile
CREATE POLICY "profiles: own read"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles: own update"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

-- Admins can update any profile (e.g. deactivate, change user_type)
CREATE POLICY "profiles: admin update all"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

-- ============================================================
-- site_content
-- ============================================================
-- Anyone (including anon) can read site content (public website)
CREATE POLICY "site_content: public read"
    ON public.site_content FOR SELECT
    USING (TRUE);

-- Only admins can insert/update/delete content sections
CREATE POLICY "site_content: admin write"
    ON public.site_content FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- products
-- ============================================================
-- Public can read active products
CREATE POLICY "products: public read active"
    ON public.products FOR SELECT
    USING (is_active = TRUE);

-- Admins can read all (including drafts)
CREATE POLICY "products: admin read all"
    ON public.products FOR SELECT
    USING (public.is_admin());

-- Only admins can create/update/delete products
CREATE POLICY "products: admin write"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "products: admin update"
    ON public.products FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "products: admin delete"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- ============================================================
-- testimonials
-- ============================================================
-- Public can read visible testimonials
CREATE POLICY "testimonials: public read visible"
    ON public.testimonials FOR SELECT
    USING (is_visible = TRUE);

-- Admins can manage all
CREATE POLICY "testimonials: admin all"
    ON public.testimonials FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- newsletter_subscribers
-- ============================================================
-- Anyone can subscribe (insert own email)
CREATE POLICY "newsletter: public subscribe"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (TRUE);

-- Users can unsubscribe themselves (update where email matches)
-- Note: enforced in the Worker — RLS here is a safety net
CREATE POLICY "newsletter: admin read"
    ON public.newsletter_subscribers FOR SELECT
    USING (public.is_admin());

CREATE POLICY "newsletter: admin manage"
    ON public.newsletter_subscribers FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- orders
-- ============================================================
-- Customers can read their own orders
CREATE POLICY "orders: customer read own"
    ON public.orders FOR SELECT
    USING (auth.uid() = customer_id);

-- Customers can create orders
CREATE POLICY "orders: customer insert"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

-- Admins can read and manage all orders
CREATE POLICY "orders: admin all"
    ON public.orders FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- order_items
-- ============================================================
-- Customers can read items of their own orders
CREATE POLICY "order_items: customer read own"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_items.order_id
              AND customer_id = auth.uid()
        )
    );

-- Admins can manage all
CREATE POLICY "order_items: admin all"
    ON public.order_items FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ============================================================
-- customer_addresses
-- ============================================================
-- Customers own their addresses
CREATE POLICY "addresses: customer read own"
    ON public.customer_addresses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "addresses: customer insert"
    ON public.customer_addresses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses: customer update own"
    ON public.customer_addresses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses: customer delete own"
    ON public.customer_addresses FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can read all addresses
CREATE POLICY "addresses: admin read"
    ON public.customer_addresses FOR SELECT
    USING (public.is_admin());

-- ============================================================
-- migration_history
-- ============================================================
-- Only service_role (migration runner) can access this table.
-- No JWT-based access — runner uses service_role key directly.
CREATE POLICY "migration_history: no direct access"
    ON public.migration_history FOR ALL
    USING (FALSE);
