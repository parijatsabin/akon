-- ============================================================
-- Migration: 002_create_users_profiles
-- Provider:  Supabase (PostgreSQL)
-- Description: User profiles linked to Supabase Auth.
--   Supabase manages auth.users (email, password, sessions, JWT).
--   We extend it with a public.profiles table for app-level data.
--   user_type controls routing: 'customer' → site, 'admin' → /admin
-- ============================================================

-- ── User type enum ────────────────────────────────────────────
CREATE TYPE user_type AS ENUM ('customer', 'admin');

-- ── Profiles table ────────────────────────────────────────────
-- One row per auth.users entry. Created automatically on signup
-- via the trigger below.
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type       user_type NOT NULL DEFAULT 'customer',
    first_name      TEXT,
    last_name       TEXT,
    phone           TEXT,
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

-- Index on user_type for fast admin/customer queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- ── Auto-create profile on new Supabase Auth signup ──────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, user_type, first_name, last_name)
    VALUES (
        NEW.id,
        -- If the signup includes a user_type in raw_user_meta_data, use it.
        -- Defaults to 'customer' for all public signups.
        COALESCE(
            (NEW.raw_user_meta_data->>'user_type')::user_type,
            'customer'
        ),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$;

-- Trigger: fires after every new row in auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ── Auto-update updated_at on profile change ─────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- ── Comments ─────────────────────────────────────────────────
COMMENT ON TABLE public.profiles IS
    'App-level user data extending Supabase auth.users. '
    'One profile per user. Deletion cascades from auth.users.';
COMMENT ON COLUMN public.profiles.user_type IS
    'customer: public-facing app and mobile. admin: /admin panel access.';
COMMENT ON COLUMN public.profiles.is_active IS
    'Soft-disable an account without deleting auth.users entry.';
