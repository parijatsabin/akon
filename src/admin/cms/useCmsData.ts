/**
 * useCmsData — React hook for reading live CMS data in the admin panel.
 *
 * Priority:
 *   1. On mount: hydrate from Worker API (latest server-side data)
 *   2. On admin save: cms:update event fires instantly (localStorage)
 *   3. Fallback: localStorage / defaults if API is unreachable
 *
 * Future: replace api.getFullCms() with a useQuery/SWR call for
 * automatic revalidation and stale-while-revalidate behaviour.
 */

import { useState, useEffect } from "react";
import { readStore } from "./cmsStore";
import { api } from "../../api/client.ts";
import type { SiteData } from "../types/cms.types";

export function useCmsData(): SiteData {
    const [data, setData] = useState<SiteData>(() => readStore());

    // Hydrate from API once on mount
    useEffect(() => {
        let cancelled = false;

        api.getFullCms().then((result) => {
            if (cancelled) return;
            if (result.ok && result.data && Object.keys(result.data as object).length > 0) {
                const raw = result.data as Record<string, unknown>;
                const merged = { ...readStore(), ...raw } as SiteData;
                setData(merged);
            }
        });

        return () => { cancelled = true; };
    }, []);

    // React to admin saves (local cms:update event)
    useEffect(() => {
        const handler = (e: Event) => {
            setData((e as CustomEvent<SiteData>).detail);
        };
        window.addEventListener("cms:update", handler);
        return () => window.removeEventListener("cms:update", handler);
    }, []);

    return data;
}
