/**
 * Shared setup for the migration scripts.
 *
 * These run on Node, not in the browser, and use the service-role key — which
 * bypasses RLS entirely. Nothing here may ever be imported from src/.
 */

import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

/** Reads a required variable, failing with an actionable message rather than undefined. */
export function required(name: string): string {
    const value = process.env[name];
    if (!value) {
        console.error(
            `\n  Missing ${name}.\n` +
            `  Copy .env.example to .env.local and fill it in.\n`
        );
        process.exit(1);
    }
    return value;
}

/** Service-role client. Bypasses RLS — scripts only. */
export function serviceClient(): SupabaseClient {
    return createClient(
        required("VITE_SUPABASE_URL"),
        required("SUPABASE_SERVICE_ROLE_KEY"),
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
}

/** Anon client. Used by verify-migration to check what the public actually sees. */
export function anonClient(): SupabaseClient {
    return createClient(
        required("VITE_SUPABASE_URL"),
        required("VITE_SUPABASE_ANON_KEY"),
        { auth: { persistSession: false, autoRefreshToken: false } }
    );
}

// ── Tiering constants — the single definition ─────────────────
// Mirrored by the CHECK constraints in migration 0011. If you change one,
// change both; the DB is the enforcement, this is the ingest side of it.
// 8 KB, the conventional inline-vs-request cutoff. Tuned down from 20 KB after
// measurement: a 13.6 KB image becomes 18 KB of base64 inside the blocking
// get_site_data() document, which costs far more than the round trip it saves.
export const INLINE_MAX_BYTES = 8_192;       // 8 KB decoded
export const INLINE_CEILING_BYTES = 200_000; // total across all inline assets
export const MAX_EDGE_PX = 1920;
export const WEBP_QUALITY = 80;

export function formatBytes(n: number): string {
    return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}
