-- ============================================================
-- Migration: 001_create_extensions
-- Provider:  Supabase (PostgreSQL)
-- Description: Enable required Postgres extensions
-- ============================================================

-- uuid_generate_v4() support (gen_random_uuid() is built-in in PG14+,
-- but we enable uuid-ossp for broader compatibility)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto for crypt() and gen_salt() — used for password hashing
-- if ever moving away from Supabase Auth
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- citext for case-insensitive text (emails stored lowercase always)
CREATE EXTENSION IF NOT EXISTS "citext";
