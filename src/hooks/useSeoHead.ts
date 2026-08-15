/**
 * useSeoHead — writes meta tags directly to <head>. No extra dependency needed.
 * Re-runs whenever site data changes, so admin edits update the tags live.
 */

import { useEffect } from "react";
import type { SiteData } from "../data/types";

export function useSeoHead(seo: SiteData["seo"], brandName: string): void {
    useEffect(() => {
        const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
            let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        if (seo.metaTitle) document.title = seo.metaTitle;
        if (seo.metaDescription) setMeta("description", seo.metaDescription);
        if (seo.keywords) setMeta("keywords", seo.keywords);

        // Open Graph
        if (seo.ogTitle) setMeta("og:title", seo.ogTitle, "property");
        if (seo.ogDescription) setMeta("og:description", seo.ogDescription, "property");
        if (seo.ogImage) setMeta("og:image", seo.ogImage, "property");
        setMeta("og:type", "website", "property");
        setMeta("og:site_name", brandName, "property");
    }, [seo, brandName]);
}
