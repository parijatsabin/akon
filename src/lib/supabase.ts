/**
 * The one Supabase client the browser uses.
 *
 * Built from the anon key, so every request is subject to RLS. What that key
 * can do is defined entirely by supabase/migrations/0014_rls.sql: read
 * content, insert a contact or newsletter submission, and nothing else until
 * a session exists.
 *
 * Missing configuration throws here, at import time, rather than surfacing
 * later as a confusing network error. That matches the no-fallback principle:
 * a misconfigured deployment must fail visibly, not render half a site.
 */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
        "(see .env.example) and rebuild — these are inlined at build time, so a " +
        "deployed bundle cannot pick them up at runtime."
    );
}

export const supabase = createClient(url, anonKey, {
    auth: {
        // The CMS session should survive a page refresh; see AuthContext.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
