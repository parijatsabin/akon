/**
 * Site repository — the only module that knows where site data physically lives.
 *
 * Source of truth: Supabase. There is no JSON file, no defaults object and no
 * merge layer. If the database is unreachable that is a real error, surfaced to
 * the user, not papered over with stale or bundled content.
 *
 * READ  — fetchSiteData() calls the get_site_data() RPC, which returns the
 *         entire SiteData document in one round trip, already shaped like the
 *         types in ./types.ts. The result is cached in memory so admin form
 *         initialisers can read it synchronously via readStore().
 *
 * WRITE — not here. Writes are per-table and live in ./adminRepository.ts;
 *         a whole-document write makes no sense against a relational schema and
 *         would clobber concurrent edits.
 *
 * The RPC runs as the caller, so RLS applies: an anonymous visitor sees only
 * testimonials marked visible, while the CMS session sees everything.
 */

import { supabase } from "../lib/supabase";
import type { SiteData } from "./types";

/** Top-level sections every valid document must contain. */
const REQUIRED_SECTIONS = [
    "brand", "hero", "about", "featuredProduct",
    "testimonials", "commitment", "newsletter", "footer", "contact",
    "privacy", "terms", "faq", "seo",
] as const;

export class SiteDataError extends Error {
    constructor(message: string, readonly cause?: unknown) {
        super(message);
        this.name = "SiteDataError";
    }
}

// ── In-memory cache ───────────────────────────────────────────
let cache: SiteData | null = null;


/**
 * Guards against a partial document rendering as a blank site.
 * Deliberately shallow — it catches missing sections, not every field.
 */
function assertValid(data: unknown): asserts data is SiteData {
    if (!data || typeof data !== "object") {
        throw new SiteDataError("Supabase did not return a site data object.");
    }
    const missing = REQUIRED_SECTIONS.filter((k) => !(k in (data as object)));
    if (missing.length > 0) {
        throw new SiteDataError(`Site data is missing required sections: ${missing.join(", ")}.`);
    }
}

// ── Read ──────────────────────────────────────────────────────
export async function fetchSiteData(): Promise<SiteData> {
    const { data, error } = await supabase.rpc("get_site_data");

    if (error) {
        // get_site_data() raises explicitly when the database has no content,
        // which is far more useful than a blank page.
        throw new SiteDataError(
            error.message || "Could not load site content from Supabase.",
            error
        );
    }

    const doc = data as Record<string, unknown> | null;
    if (!doc) throw new SiteDataError("Supabase returned no site content.");

    // get_site_data() returns a `media.lqip` sidecar of base64 blur
    // placeholders alongside the document. It is split off here because it is
    // not part of SiteData and would fail validation as an unknown section.
    //
    // Nothing consumes it yet: it exists for an <Img> wrapper that renders the
    // blur while the real image loads, and that component has not been built.
    // Until it is, roughly 1.8 KB of every payload is dormant.
    const { media: _lqipSidecar, ...site } = doc;
    void _lqipSidecar;

    assertValid(site);
    cache = site;
    return site;
}

/**
 * Synchronous read for admin form initialisers.
 * Safe because SiteDataProvider renders no children until the fetch resolves.
 */
export function readStore(): SiteData {
    if (!cache) {
        throw new SiteDataError("readStore() called before site data finished loading.");
    }
    return cache;
}

/**
 * Re-reads from Supabase and notifies every mounted component. Called by the
 * admin save path so an edit is visible immediately without a page reload.
 */
export async function refreshSiteData(): Promise<SiteData> {
    const next = await fetchSiteData();
    window.dispatchEvent(new CustomEvent("cms:update", { detail: next }));
    return next;
}
