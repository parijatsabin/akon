/**
 * CMS Store — file-based, no localStorage.
 *
 * Source of truth: /public/cms-data.json
 *
 * READ  — fetch("/cms-data.json") on every readStore() call.
 *         The module also caches the last known value in memory
 *         so synchronous callers (admin form inits) get an instant result.
 *
 * WRITE — In development Vite exposes a custom plugin endpoint at
 *         /__cms_write that writes directly to public/cms-data.json.
 *         In production (static deploy) the admin saves a downloadable
 *         cms-data.json that the developer commits to replace the file.
 *
 * The cms:update custom event is still dispatched on every write so
 * all live components re-render instantly — no page reload needed.
 */

import type { SiteData } from "../types/cms.types";
import { DEFAULT_SITE_DATA } from "../types/cms.defaults";

// ── In-memory cache ───────────────────────────────────────────
// Populated by the first fetch; used as fallback for sync reads.
let _cache: SiteData = structuredClone(DEFAULT_SITE_DATA);
let _loaded = false;

// ── Read (async) ──────────────────────────────────────────────
export async function loadStore(): Promise<SiteData> {
    try {
        const res = await fetch("/cms-data.json?t=" + Date.now());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as SiteData;
        _cache = data;
        _loaded = true;
        return data;
    } catch (err) {
        console.warn("[CMS] Could not load cms-data.json, using defaults.", err);
        _cache = structuredClone(DEFAULT_SITE_DATA);
        _loaded = true;
        return _cache;
    }
}

// ── Read (sync — returns cache, falls back to defaults) ────────
// Used by admin form initialisers that run synchronously on mount.
// Always call loadStore() first (useCmsData does this on mount).
export function readStore(): SiteData {
    return _loaded ? _cache : structuredClone(DEFAULT_SITE_DATA);
}

// ── Write ─────────────────────────────────────────────────────
export async function writeStore(data: SiteData): Promise<void> {
    _cache = data;
    const json = JSON.stringify(data, null, 2);

    // Dispatch immediately so the UI updates without waiting for the write
    window.dispatchEvent(new CustomEvent("cms:update", { detail: data }));

    // Try the Vite dev-server write endpoint first
    try {
        const res = await fetch("/__cms_write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: json,
        });
        if (res.ok) return; // written to disk — done
    } catch {
        // Not in dev or endpoint unavailable — fall through to download
    }

    // Production fallback: download the file so the developer can commit it
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cms-data.json";
    a.click();
    URL.revokeObjectURL(url);
}

// ── Partial section update ────────────────────────────────────
export async function updateSection<K extends keyof SiteData>(
    section: K,
    value: SiteData[K]
): Promise<SiteData> {
    const current = readStore();
    const next = { ...current, [section]: value };
    await writeStore(next);
    return next;
}

// ── Reset to defaults ─────────────────────────────────────────
export async function resetStore(): Promise<void> {
    await writeStore(structuredClone(DEFAULT_SITE_DATA));
}
