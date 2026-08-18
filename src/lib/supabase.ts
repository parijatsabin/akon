/**
 * The one Supabase client the browser uses.
 *
 * Built from the anon key, so every request is subject to RLS. What that key
 * can do is defined entirely by supabase/migrations/0001_initial.sql: read
 * content, insert a contact or newsletter row, and nothing else until a
 * session exists.
 *
 * WHY THIS DOES NOT THROW ON IMPORT: it used to. Missing configuration raised
 * at module scope, which meant the very first import failed, React never
 * mounted, and the deployed site was a white screen with only a console error
 * to explain it. Every push after Supabase was added shipped that.
 *
 * The values are inlined by Vite at BUILD time, so a deploy built without them
 * can never recover at runtime — the only honest thing to do is say so on the
 * page. `isSupabaseConfigured` lets the data layer render a real message.
 * scripts/check-build-env.mjs should stop such a build reaching production in
 * the first place; this is the second line of defence.
 */

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False when the bundle was built without Supabase configuration. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const configurationError =
    "This build was published without its Supabase configuration, so it cannot " +
    "load any content. The values are compiled in when the site is built, so " +
    "the site needs rebuilding with them set.";

if (!isSupabaseConfigured) {
    // Loud in the console for whoever is debugging; the visible message is
    // rendered by SiteDataProvider.
    console.error(`[supabase] ${configurationError}`);
}

/**
 * Unreachable placeholders keep createClient from throwing when unconfigured.
 * Requests then fail visibly against a host that does not exist, rather than
 * silently pointing somewhere real.
 */
export const supabase = createClient(
    url || "https://unconfigured.invalid",
    anonKey || "unconfigured",
    {
        auth: {
            // The CMS session should survive a page refresh; see AuthContext.
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
        },
    }
);
