-- ============================================================
-- Migration: 002_create_users
-- Provider:  PostgreSQL (standalone)
-- Description: Full users table — no Supabase Auth dependency.
--   Passwords hashed with bcrypt via pgcrypto.
--   For standalone Postgres deployments (Neon, Railway, etc.)
-- ============================================================

CREATE TYPE user_type AS ENUM ('customer', 'admin');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TABLE IF NOT EXISTS public.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT NOT NULL,
    password_hash   TEXT NOT NULL,               -- bcrypt hash via pgcrypto
    user_type       user_type NOT NULL DEFAULT 'customer',
    first_name      TEXT,
    last_name       TEXT,
    phone           TEXT,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,

    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_format CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$')
);

CREATE INDEX IF NOT EXISTS idx_users_email      ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type  ON public.users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active  ON public.users(is_active);

CREATE OR REPLACE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Sessions table (replaces Supabase JWT) ────────────────────
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL,               -- hashed session token
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      TEXT,
    user_agent      TEXT,

    CONSTRAINT sessions_token_unique UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON public.user_sessions(expires_at);

COMMENT ON TABLE public.users IS
    'Standalone users table. Used when NOT on Supabase. '
    'Supabase deployments use auth.users + public.profiles instead.';
