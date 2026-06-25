-- ============================================================
-- Migration: 009_create_migration_history
-- Provider:  Supabase (PostgreSQL)
-- Description: Migration tracking table. The migration runner
--   writes a row here on every successful run. Prevents re-running
--   the same migration and tracks rollbacks.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.migration_history (
    id                  SERIAL PRIMARY KEY,
    migration_name      TEXT NOT NULL,       -- e.g. '004_create_products'
    version             TEXT NOT NULL,       -- e.g. '004'
    executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    execution_time_ms   INTEGER,             -- how long the migration took
    database_provider   TEXT NOT NULL,       -- 'supabase' | 'postgres' | 'mysql'
    status              TEXT NOT NULL,       -- 'success' | 'failed' | 'rolled_back'
    checksum            TEXT NOT NULL,       -- SHA-256 of the migration file content
    error_message       TEXT,               -- populated only if status = 'failed'
    rolled_back_at      TIMESTAMPTZ,        -- set when this migration is rolled back

    CONSTRAINT migration_history_status_valid CHECK (
        status IN ('success', 'failed', 'rolled_back')
    ),
    CONSTRAINT migration_history_provider_valid CHECK (
        database_provider IN ('supabase', 'postgres', 'mysql')
    ),
    -- Prevent running same migration twice (same name + provider + status=success)
    CONSTRAINT migration_history_no_duplicate UNIQUE (
        migration_name, database_provider, status
    )
);

CREATE INDEX IF NOT EXISTS idx_migration_history_name     ON public.migration_history(migration_name);
CREATE INDEX IF NOT EXISTS idx_migration_history_provider ON public.migration_history(database_provider);
CREATE INDEX IF NOT EXISTS idx_migration_history_status   ON public.migration_history(status);

COMMENT ON TABLE public.migration_history IS
    'Records every migration execution. Used by the runner to detect '
    'already-applied migrations and support rollback tracking.';
COMMENT ON COLUMN public.migration_history.checksum IS
    'SHA-256 of the .sql file content. If a file is modified after being run, '
    'the runner will detect the mismatch and warn.';
