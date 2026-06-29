/**
 * CMS Store — dual-write layer.
 *
 * Writes to both:
 *   1. Worker API (/api/cms/:section) — persistent, server-side
 *   2. localStorage — instant UI feedback + offline fallback
 *
 * Reads always prefer localStorage for instant render,
 * then the API hydrates on mount (via useSiteContent hook).
 *
 * The JSON structure mirrors siteContent.ts shape exactly.
 * Swapping the API URL is a one-line change in api/client.ts.
 */

import type { SiteData } from "../types/cms.types";
import { DEFAULT_SITE_DATA } from "../types/cms.defaults";
import { api } from "../../api/client.ts";

const STORAGE_KEY = "anok_cms_v1";

// ── Read (localStorage) ───────────────────────────────────────
export function readStore(): SiteData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_SITE_DATA);
        const parsed = JSON.parse(raw) as Partial<SiteData>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return deepMerge(DEFAULT_SITE_DATA as any, parsed) as SiteData;
    } catch {
        return structuredClone(DEFAULT_SITE_DATA);
    }
}

// ── Write (localStorage + API) ────────────────────────────────
export function writeStore(data: SiteData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("cms:update", { detail: data }));
}

// ── Partial section update ─────────────────────────────────────
export function updateSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K]
): SiteData {
    const current = readStore();
    const next = { ...current, [section]: value };

    // Write to localStorage immediately (instant UI)
    writeStore(next);

    // Write to API in the background (non-blocking)
    api.updateCmsSection(section as string, value).then((result) => {
        if (!result.ok) {
            console.warn(
                `[CMS] API write failed for section "${section}":`,
                result.error,
                "— data is saved locally only."
            );
        }
    });

    return next;
}

// ── Reset to defaults ──────────────────────────────────────────
export function resetStore(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cms:update", { detail: DEFAULT_SITE_DATA }));
}

// ── Helpers ────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sv = source[key];
        const tv = target[key];
        if (
            sv !== null && typeof sv === "object" && !Array.isArray(sv) &&
            tv !== null && typeof tv === "object" && !Array.isArray(tv)
        ) {
            result[key] = deepMerge(tv, sv);
        } else {
            result[key] = sv;
        }
    }
    return result;
}
