/**
 * ============================================================
 * ANOK Cloudflare Worker — API Layer
 * ============================================================
 * Handles all /api/* routes. Everything else is served as
 * static assets by Cloudflare (the React SPA).
 *
 * Route map:
 *   /api/cms/*           → CMS content (read public, write admin)
 *   /api/products/*      → Product catalogue
 *   /api/orders/*        → E-commerce orders
 *   /api/newsletter/*    → Email subscriptions
 *
 * Auth: Supabase JWT in Authorization: Bearer <token>
 * DB:   Supabase REST API via service_role key (Worker secret)
 *
 * To switch to Postgres/MySQL:
 *   1. Change `new SupabaseClient(env)` below to your new provider
 *   2. Add the new provider to src/api/db/
 *   Everything else — routes, types, logic — stays identical.
 * ============================================================
 */

import type { WorkerEnv } from "./api/db/supabase.ts";
import { SupabaseClient } from "./api/db/supabase.ts";
import { handleCms } from "./api/routes/cms.ts";
import { handleProducts } from "./api/routes/products.ts";
import { handleOrders } from "./api/routes/orders.ts";
import { handleNewsletter } from "./api/routes/newsletter.ts";
import { corsHeaders, jsonError } from "./api/routes/helpers.ts";

export default {
    async fetch(request: Request, env: WorkerEnv): Promise<Response> {
        const url = new URL(request.url);

        // Only intercept /api/* — let Cloudflare serve everything else as static
        if (!url.pathname.startsWith("/api/")) {
            // Return null to fall through to static asset serving
            return new Response(null, { status: 404 });
        }

        // Handle CORS preflight
        if (request.method === "OPTIONS") {
            return corsHeaders();
        }

        // ── Initialize DB client ────────────────────────────────
        // To switch database: replace SupabaseClient with your provider.
        // The rest of this file does not change.
        const db = new SupabaseClient(env);

        try {
            // ── Route dispatcher ──────────────────────────────────
            if (url.pathname.startsWith("/api/cms")) {
                return await handleCms(request, url, db, env);
            }

            if (url.pathname.startsWith("/api/products")) {
                return await handleProducts(request, url, db, env);
            }

            if (url.pathname.startsWith("/api/orders")) {
                return await handleOrders(request, url, db, env);
            }

            if (url.pathname.startsWith("/api/newsletter")) {
                return await handleNewsletter(request, url, db, env);
            }

            return jsonError("API route not found", 404);

        } catch (err) {
            console.error("[Worker Error]", err);
            const message = err instanceof Error ? err.message : "Internal server error";
            return jsonError(message, 500);
        }
    },
} satisfies { fetch: (request: Request, env: WorkerEnv) => Promise<Response> };
