-- ============================================================
-- Migration: 006_create_newsletter
-- Provider:  Supabase (PostgreSQL)
-- Description: Newsletter subscriber list.
--   Stores email subscriptions from the public-facing
--   newsletter signup form.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- citext makes email lookups case-insensitive automatically
    email               CITEXT NOT NULL,

    subscribed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    unsubscribed_at     TIMESTAMPTZ,        -- set when user unsubscribes

    -- GDPR / audit trail
    ip_address          TEXT,
    user_agent          TEXT,

    CONSTRAINT newsletter_email_unique UNIQUE (email),
    CONSTRAINT newsletter_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX IF NOT EXISTS idx_newsletter_is_active    ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON public.newsletter_subscribers(subscribed_at DESC);

COMMENT ON TABLE public.newsletter_subscribers IS
    'Email subscribers from the Newsletter section signup form.';
COMMENT ON COLUMN public.newsletter_subscribers.email IS
    'Stored via citext extension — lookups are case-insensitive.';
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribed_at IS
    'NULL means still subscribed. Set to NOW() on unsubscribe — never DELETE rows.';
