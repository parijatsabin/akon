/**
 * useSeoHead — writes meta tags directly to <head>. No extra dependency needed.
 * Re-runs whenever site data changes, so admin edits update the tags live.
 */

import { useEffect } from "react";
import type { SiteData } from "../data/types";

/**
 * The tab title and the SEO title are not the same string. A tab is a few
 * dozen pixels of a strip shared with every other open tab, so it wants the
 * shortest thing that identifies the site — the brand name. seo.metaTitle is
 * written for search results and link previews, where the descriptive form
 * earns its length, so it keeps driving og:title rather than the tab.
 *
 * Pass tabTitle to distinguish a page whose tab would otherwise be identical
 * to the homepage's.
 */
export function useSeoHead(
    seo: SiteData["seo"],
    brandName: string,
    tabTitle?: string,
): void {
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

        document.title = tabTitle || brandName;
        if (seo.metaDescription) setMeta("description", seo.metaDescription);
        if (seo.keywords) setMeta("keywords", seo.keywords);

        // Open Graph. Falls back to the descriptive metaTitle, which no longer
        // has a home in the tab but is still the right string for a preview.
        if (seo.ogTitle || seo.metaTitle) {
            setMeta("og:title", seo.ogTitle || seo.metaTitle, "property");
        }
        if (seo.ogDescription) setMeta("og:description", seo.ogDescription, "property");
        if (seo.ogImage) setMeta("og:image", seo.ogImage, "property");
        setMeta("og:type", "website", "property");
        setMeta("og:site_name", brandName, "property");
    }, [seo, brandName, tabTitle]);
}
