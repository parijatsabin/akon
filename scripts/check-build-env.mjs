/**
 * Refuses to build without the Supabase configuration.
 *
 * WHY THIS EXISTS: the values are inlined by Vite at build time. When they are
 * absent the build still SUCCEEDS — it just bakes `undefined` into the bundle,
 * the Supabase client fails on import, React never mounts, and the deploy
 * replaces a working site with a white screen. Nothing in the log says so.
 *
 * Failing here keeps the previous deploy live instead, which is the right
 * outcome: a stale site beats a blank one.
 *
 * Uses Vite's own loader so it sees .env.local locally and real environment
 * variables in CI, exactly as the build itself will.
 */

import { loadEnv } from "vite";

const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

const env = { ...loadEnv("production", process.cwd(), "VITE_"), ...process.env };
const missing = REQUIRED.filter((k) => !env[k]);

if (missing.length > 0) {
    console.error(`
  Build stopped: Supabase is not configured.

  Missing: ${missing.join(", ")}

  These are read at BUILD time and compiled into the bundle, so setting them
  after a deploy changes nothing — the site must be rebuilt.

    Locally   put them in .env.local (see .env.example)
    Cloudflare  Workers & Pages -> akon -> Settings -> Variables and Secrets,
                add them for the *Build* environment, then redeploy

  Without them the build would succeed and publish a blank page.
`);
    process.exit(1);
}

// Cheap sanity check: a truncated paste is otherwise indistinguishable from a
// working value until the site is live.
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(env.VITE_SUPABASE_URL)) {
    console.error(`
  Build stopped: VITE_SUPABASE_URL does not look like a Supabase project URL.

    got: ${env.VITE_SUPABASE_URL}
    expected: https://<project-ref>.supabase.co
`);
    process.exit(1);
}

console.log(`  Supabase configured: ${env.VITE_SUPABASE_URL}`);
