/**
 * SiteDataProvider — the single entry point through which the UI reads site data.
 *
 * Renders nothing until the fetch resolves. That is deliberate: with the
 * defaults object gone there is no placeholder content to fall back on, so a
 * failed load must be visible rather than silently rendering a stale shell.
 * It also lets admin form initialisers call readStore() synchronously and
 * always get a populated cache.
 *
 * Every component reads data via useSiteData(). No component imports the
 * repository directly — that indirection is what makes the future swap to a
 * Node/MySQL API a change to siteRepository.ts alone.
 */

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchSiteData } from "./siteRepository";
import type { SiteData } from "./types";

const SiteDataContext = createContext<SiteData | null>(null);

type Status =
    | { phase: "loading" }
    | { phase: "ready"; data: SiteData }
    | { phase: "error"; message: string };

export const SiteDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<Status>({ phase: "loading" });

    const load = useCallback(() => {
        setStatus({ phase: "loading" });
        fetchSiteData()
            .then((data) => setStatus({ phase: "ready", data }))
            .catch((err: unknown) => {
                console.error("[site] Failed to load site data.", err);
                setStatus({
                    phase: "error",
                    message: err instanceof Error ? err.message : "Unknown error.",
                });
            });
    }, []);

    useEffect(() => {
        load();

        // Re-render whenever the admin saves
        const handler = (e: Event) =>
            setStatus({ phase: "ready", data: (e as CustomEvent<SiteData>).detail });
        window.addEventListener("cms:update", handler);
        return () => window.removeEventListener("cms:update", handler);
    }, [load]);

    if (status.phase === "loading") return <SiteLoading />;
    if (status.phase === "error") return <SiteError message={status.message} onRetry={load} />;

    return <SiteDataContext.Provider value={status.data}>{children}</SiteDataContext.Provider>;
};

export function useSiteData(): SiteData {
    const ctx = useContext(SiteDataContext);
    if (!ctx) throw new Error("useSiteData must be used inside <SiteDataProvider>");
    return ctx;
}

// ── Loading ───────────────────────────────────────────────────
const SiteLoading: React.FC = () => (
    <div className="site-status" role="status" aria-live="polite">
        <div className="site-status-spinner" aria-hidden="true" />
        <span className="site-status-text">Loading…</span>
    </div>
);

// ── Error ─────────────────────────────────────────────────────
const SiteError: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="site-status" role="alert">
        <h1 className="site-status-title">Content unavailable</h1>
        <p className="site-status-text">
            The site content could not be loaded, so nothing can be displayed.
        </p>
        <p className="site-status-detail">{message}</p>
        <button type="button" className="btn btn-accent" onClick={onRetry}>
            Try again
        </button>
    </div>
);
