-- ============================================================
-- Migration: 008_create_addresses
-- Provider:  Supabase (PostgreSQL)
-- Description: Saved delivery addresses for logged-in customers.
--   Used in checkout to pre-fill the shipping form.
--   Also used by the future mobile app (same table, same API).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- User-defined label for this address
    label           TEXT NOT NULL DEFAULT 'Home', -- e.g. 'Home', 'Office', 'Other'

    full_name       TEXT NOT NULL,
    phone           TEXT NOT NULL,
    address_line1   TEXT NOT NULL,
    address_line2   TEXT,
    city            TEXT NOT NULL,
    district        TEXT,
    province        TEXT,                          -- Nepal has 7 provinces
    country         TEXT NOT NULL DEFAULT 'Nepal',
    postal_code     TEXT,

    -- Only one address per user can be default
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT addresses_full_name_nonempty  CHECK (full_name <> ''),
    CONSTRAINT addresses_city_nonempty       CHECK (city <> ''),
    CONSTRAINT addresses_line1_nonempty      CHECK (address_line1 <> '')
);

-- Enforce only one default address per user via partial unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_default_per_user
    ON public.customer_addresses(user_id)
    WHERE is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.customer_addresses(user_id);

-- When setting a new default, unset all others for that user
CREATE OR REPLACE FUNCTION public.enforce_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.customer_addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id
          AND id <> NEW.id
          AND is_default = TRUE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER addresses_enforce_single_default
    BEFORE INSERT OR UPDATE ON public.customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_single_default_address();

CREATE OR REPLACE TRIGGER addresses_updated_at
    BEFORE UPDATE ON public.customer_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.customer_addresses IS
    'Saved delivery addresses for registered customers. '
    'Used in web checkout and future mobile app.';
COMMENT ON COLUMN public.customer_addresses.is_default IS
    'One default per user enforced by trigger and partial unique index.';
