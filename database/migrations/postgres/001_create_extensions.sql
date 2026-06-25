-- ============================================================
-- Migration: 001_create_extensions
-- Provider:  PostgreSQL (standalone — no Supabase Auth)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
