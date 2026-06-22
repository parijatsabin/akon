/**
 * CMS Store — single abstraction layer between data and UI.
 *
 * v1: persists to localStorage as JSON.
 * Future: swap `readStore` / `writeStore` to fetch/POST an API — zero
 * component changes required.
 *
 * The JSON structure mirrors the siteContent.ts shape exactly so that
 * migration to a real backend is a straight field-for-field mapping.
 */

import type { SiteData } from "../types/cms.types";
import { DEFAULT_SITE_DATA } from "../types/cms.defaults";

const STORAGE_KEY = "anok_cms_v1";

// ── Read ──────────────────────────────────────────────────────
export function readStore(): SiteData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(DEFAULT_SITE_DATA);
        const parsed = JSON.parse(raw) as Partial<SiteData>;
        // Deep merge: keep defaults for any missing keys (forward compat)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return deepMerge(DEFAULT_SITE_DATA as any, parsed) as SiteData;
    } catch {
        return structuredClone(DEFAULT_SITE_DATA);
    }
}

// ── Write ─────────────────────────────────────────────────────
export function writeStore(data: SiteData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch a custom event so any live component can react
    window.dispatchEvent(new CustomEvent("cms:update", { detail: data }));
}

// ── Partial section update ────────────────────────────────────
export function updateSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K]
): SiteData {
    const current = readStore();
    const next = { ...current, [section]: value };
    writeStore(next);
    return next;
}

// ── Reset to defaults ─────────────────────────────────────────
export function resetStore(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cms:update", { detail: DEFAULT_SITE_DATA }));
}

// ── Helpers ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge(target: any, source: any): any {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        const sv = source[key];
        const tv = target[key];
        if (
            sv !== null &&
            typeof sv === "object" &&
            !Array.isArray(sv) &&
            tv !== null &&
            typeof tv === "object" &&
            !Array.isArray(tv)
        ) {
            result[key] = deepMerge(tv, sv);
        } else {
            result[key] = sv;
        }
    }
    return result;
}
