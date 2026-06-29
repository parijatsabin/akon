/**
 * useSiteContent — fetches full site content from the Worker API.
 * Falls back to localStorage (cmsStore) if the API is unreachable,
 * so the site stays functional during the migration transition period.
 */

import { useState, useEffect } from "react";
import { api } from "../client.ts";
import { readStore } from "../../admin/cms/cmsStore.ts";
import type { SiteData } from "../../admin/types/cms.types.ts";

interface State {
    data: SiteData;
    loading: boolean;
    error: string | null;
    source: "api" | "localStorage";
}

export function useSiteContent(): State {
    const [state, setState] = useState<State>({
        data: readStore(),          // instant render from localStorage
        loading: true,
        error: null,
        source: "localStorage",
    });

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const result = await api.getFullCms();

            if (cancelled) return;

            if (result.ok && result.data && Object.keys(result.data as object).length > 0) {
                // API returned data — assemble SiteData from section map
                const raw = result.data as Record<string, unknown>;
                // The API returns { brand, hero, stats, ... } — merge with defaults
                const merged = { ...readStore(), ...raw } as SiteData;
                setState({ data: merged, loading: false, error: null, source: "api" });
            } else {
                // API unavailable — stay on localStorage data silently
                setState((s) => ({ ...s, loading: false, source: "localStorage" }));
            }
        }

        load();

        // Re-fetch when admin saves (localStorage event keeps working locally)
        const handler = (e: Event) => {
            if (!cancelled) {
                setState((s) => ({
                    ...s,
                    data: (e as CustomEvent<SiteData>).detail,
                    source: "localStorage",
                }));
            }
        };
        window.addEventListener("cms:update", handler);

        return () => {
            cancelled = true;
            window.removeEventListener("cms:update", handler);
        };
    }, []);

    return state;
}
