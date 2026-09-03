/**
 * Edge Worker — serves the SPA and writes its SEO into the HTML on the way out.
 *
 * WHY THIS EXISTS: the site's meta tags were written by React after the bundle
 * loaded. Google can render JavaScript, but it defers it to a second crawl and
 * is inconsistent about it — and Facebook, WhatsApp, Viber, Instagram and
 * LinkedIn do not execute JavaScript at all. Every link shared of this site
 * previewed as the bare "ANOK" from index.html, with no description and no
 * image. In a market where sharing happens on WhatsApp and Facebook, that was
 * costing more than any keyword choice could recover.
 *
 * HTMLRewriter streams the built index.html and injects the real tags before
 * the response leaves Cloudflare, so a crawler that never runs a line of JS
 * still receives a complete, per-route document.
 *
 * FAILURE POLICY: this Worker sits in front of a site that was previously
 * static assets and therefore could not fail. It must not become the reason
 * the site goes down. Every path through it falls back to serving the asset
 * unmodified — a page with weak meta tags beats no page at all.
 */

import { findRoute, ROUTES, SITE_ORIGIN, absoluteUrl } from "../src/seo/routes";
import { renderHead } from "../src/seo/head";
import type { SiteData } from "../src/data/types";

interface Env {
    ASSETS: { fetch(request: Request): Promise<Response> };
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
}

const CANONICAL_HOST = new URL(SITE_ORIGIN).host;

// ── Site data ─────────────────────────────────────────────────

/**
 * Cached per isolate, not globally. Cloudflare runs many isolates and recycles
 * them freely, so this is a best-effort way to avoid a Supabase round trip on
 * every HTML request — not a coherent cache. Five minutes is short enough that
 * a CMS edit appears in search results the same day and long enough that a
 * burst of traffic does not become a burst of database calls.
 */
let cached: { at: number; data: SiteData } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function loadSiteData(env: Env): Promise<SiteData | null> {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

    try {
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/get_site_data`, {
            method: "POST",
            headers: {
                apikey: env.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
            },
            body: "{}",
            // A slow database must not hold the page hostage. Past the budget
            // the visitor gets the unmodified shell, which still renders once
            // the client bundle does its own fetch.
            signal: AbortSignal.timeout(2500),
        });

        if (!res.ok) return cached?.data ?? null;

        const doc = (await res.json()) as SiteData | null;
        if (!doc?.brand?.name) return cached?.data ?? null;

        cached = { at: Date.now(), data: doc };
        return doc;
    } catch (err) {
        console.error("[seo] site data unavailable, serving unmodified shell", err);
        // Stale beats empty: an expired copy still describes the site correctly.
        return cached?.data ?? null;
    }
}

// ── Generated text routes ─────────────────────────────────────

function robotsTxt(): Response {
    const body = [
        "User-agent: *",
        "Allow: /",
        // The CMS is behind a login, but an indexed login page dilutes the
        // site's own results and invites credential-stuffing traffic.
        "Disallow: /admin",
        "",
        `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
        "",
    ].join("\n");

    return new Response(body, {
        headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=3600",
        },
    });
}

/**
 * Generated from ROUTES rather than written by hand, so a new route cannot be
 * added and then quietly left out of the sitemap.
 */
function sitemapXml(): Response {
    const urls = ROUTES.filter((r) => !r.noindex)
        .map((r) =>
            [
                "  <url>",
                `    <loc>${absoluteUrl(r.path)}</loc>`,
                `    <changefreq>${r.changefreq}</changefreq>`,
                `    <priority>${r.priority.toFixed(1)}</priority>`,
                "  </url>",
            ].join("\n"),
        )
        .join("\n");

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

    return new Response(body, {
        headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
        },
    });
}

// ── Request handling ──────────────────────────────────────────

/** Adds a header to an asset response without consuming its body. */
function withHeader(res: Response, name: string, value: string): Response {
    const out = new Response(res.body, res);
    out.headers.set(name, value);
    return out;
}

async function handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Both hostnames are custom domains on this Worker, which means identical
    // content at two addresses and split ranking signals. A 301 consolidates
    // them. Scoped to a www. prefix so workers.dev and localhost are untouched.
    if (url.hostname.startsWith("www.")) {
        return Response.redirect(`${SITE_ORIGIN}${url.pathname}${url.search}`, 301);
    }

    if (url.pathname === "/robots.txt") return robotsTxt();
    if (url.pathname === "/sitemap.xml") return sitemapXml();

    const asset = await env.ASSETS.fetch(request);

    // Belt and braces alongside robots.txt: a Disallow is a request, an
    // X-Robots-Tag is served with the response itself.
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
        return withHeader(asset, "x-robots-tag", "noindex, nofollow");
    }

    // Only documents carry meta tags. Assets are passed straight through.
    const isDocument = (asset.headers.get("content-type") ?? "").includes("text/html");
    if (!isDocument) return asset;

    const route = findRoute(url.pathname);

    // An undeclared path reaches here because not_found_handling answers
    // everything with the homepage shell at status 200. Left alone that turns
    // every typo into an indexable duplicate of the homepage, so it is served
    // but explicitly excluded.
    if (!route) return withHeader(asset, "x-robots-tag", "noindex");

    const site = await loadSiteData(env);
    if (!site) return asset;

    const routeMeta = route.meta(site);
    const head = renderHead(route.path, routeMeta, site, route.noindex);

    // Belt and braces again, as with /admin above: the meta tag is in the
    // document, the header travels with the response.
    const out = route.noindex ? withHeader(asset, "x-robots-tag", "noindex, follow") : asset;

    return new HTMLRewriter()
        // The document gets the descriptive title because that is the string a
        // search result and a link preview show. The client shortens it to the
        // tab form once React mounts; see useRouteSeo.
        .on("title", {
            element(el) {
                el.setInnerContent(routeMeta.title);
            },
        })
        .on("head", {
            element(el) {
                el.append(`\n  ${head}\n`, { html: true });
            },
        })
        .transform(out);
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        try {
            return await handle(request, env);
        } catch (err) {
            // Nothing above is worth a 500. Serve the site.
            console.error("[worker] falling back to unmodified asset", err);
            return env.ASSETS.fetch(request);
        }
    },
};
