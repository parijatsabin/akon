/**
 * useCmsData — React hook for reading live CMS data.
 *
 * Subscribes to the cms:update custom event so any component
 * re-renders immediately when the admin saves a change.
 *
 * Future: replace readStore() with a useQuery/SWR/fetch call.
 */

import { useState, useEffect } from "react";
import { readStore } from "./cmsStore";
import type { SiteData } from "../types/cms.types";

export function useCmsData(): SiteData {
    const [data, setData] = useState<SiteData>(() => readStore());

    useEffect(() => {
        const handler = (e: Event) => {
            setData((e as CustomEvent<SiteData>).detail);
        };
        window.addEventListener("cms:update", handler);
        return () => window.removeEventListener("cms:update", handler);
    }, []);

    return data;
}
