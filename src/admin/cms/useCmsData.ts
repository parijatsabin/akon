/**
 * useCmsData — fetches /public/cms-data.json on mount,
 * then stays reactive to cms:update events dispatched by writeStore.
 *
 * Returns DEFAULT_SITE_DATA synchronously on first render so no
 * component ever receives null.
 */

import { useState, useEffect } from "react";
import { loadStore } from "./cmsStore";
import { DEFAULT_SITE_DATA } from "../types/cms.defaults";
import type { SiteData } from "../types/cms.types";

export function useCmsData(): SiteData {
    const [data, setData] = useState<SiteData>(DEFAULT_SITE_DATA);

    useEffect(() => {
        // Initial fetch from cms-data.json
        loadStore().then(setData);

        // Re-render whenever the admin saves
        const handler = (e: Event) => {
            setData((e as CustomEvent<SiteData>).detail);
        };
        window.addEventListener("cms:update", handler);
        return () => window.removeEventListener("cms:update", handler);
    }, []);

    return data;
}
