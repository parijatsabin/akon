/**
 * Site repository — the only module that knows where site data physically lives.
 *
 * Source of truth: /public/cms-data.json. There is no defaults object and no
 * merge layer: what the file contains is what the site renders. A missing or
 * malformed file is a real error, surfaced to the user, not papered over.
 *
 * READ  — fetchSiteData() on app start; the result is cached in memory so
 *         admin form initialisers can read it synchronously.
 *
 * WRITE — In development, Vite exposes /__cms_write (see vite.config.ts) which
 *         writes public/cms-data.json to disk. There is no production write
 *         path by design; content is edited locally and deployed.
 *
 * MIGRATION — to move to a Node/MySQL backend, replace the two fetch() calls
 * below with GET/PUT /api/site. Nothing outside this file needs to change.
 */

import type { SiteData } from "./types";

/** Top-level sections every valid document must contain. */
const REQUIRED_SECTIONS = [
    "brand", "navLinks", "hero", "about", "featuredProduct",
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
 * Guards against a truncated or hand-edited file rendering as a blank site.
 * Deliberately shallow — it catches missing sections, not every field.
 */
function assertValid(data: unknown): asserts data is SiteData {
    if (!data || typeof data !== "object") {
        throw new SiteDataError("cms-data.json is not a JSON object.");
    }
    const missing = REQUIRED_SECTIONS.filter((k) => !(k in (data as object)));
    if (missing.length > 0) {
        throw new SiteDataError(`cms-data.json is missing required sections: ${missing.join(", ")}.`);
    }
}

// ── Read ──────────────────────────────────────────────────────
export async function fetchSiteData(): Promise<SiteData> {
    let raw: unknown;
    try {
        const res = await fetch(`/cms-data.json?t=${Date.now()}`);
        if (!res.ok) throw new SiteDataError(`Request for cms-data.json failed with HTTP ${res.status}.`);
        raw = await res.json();
    } catch (err) {
        if (err instanceof SiteDataError) throw err;
        throw new SiteDataError("Could not load cms-data.json.", err);
    }

    assertValid(raw);
    cache = raw;
    return raw;
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

// ── Write ─────────────────────────────────────────────────────
export async function writeStore(data: SiteData): Promise<void> {
    cache = data;

    // Notify live components immediately, before the disk write completes
    window.dispatchEvent(new CustomEvent("cms:update", { detail: data }));

    const res = await fetch("/__cms_write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data, null, 2),
    });
    if (!res.ok) {
        throw new SiteDataError(
            "Could not save. The CMS only writes to disk while running `npm run dev`."
        );
    }
}

// ── Partial section update ────────────────────────────────────
export async function updateSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K]
): Promise<SiteData> {
    const next = { ...readStore(), [section]: value };
    await writeStore(next);
    return next;
}
