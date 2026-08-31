/**
 * useRouteSeo — keeps the document's SEO tags correct during client-side
 * navigation.
 *
 * The Worker (worker/index.ts) writes the real tags into the HTML before it is
 * served, which is what crawlers read. But React Router never fetches a new
 * document, so moving from / to /faq in the browser would otherwise leave the
 * homepage's title, description and canonical in place. This hook re-applies
 * them from the same source of truth the Worker used.
 *
 * It runs in one place — PageShell — rather than in each page. Seven call
 * sites was seven chances for a new route to ship without any.
 *
 * Structured data is deliberately NOT re-emitted here. Crawlers read the
 * delivered document; adding a second <script type="application/ld+json">
 * mid-session would only risk duplicate entities in one DOM.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import { absoluteUrl, findRoute } from "../seo/routes";

/** Finds a meta/link tag by selector, creating it if the Worker did not. */
function upsert<T extends HTMLElement>(
    selector: string,
    create: () => T,
): T {
    const existing = document.head.querySelector<T>(selector);
    if (existing) return existing;
    const el = create();
    document.head.appendChild(el);
    return el;
}

function setMeta(attr: "name" | "property", key: string, content: string): void {
    const el = upsert<HTMLMetaElement>(`meta[${attr}="${key}"]`, () => {
        const m = document.createElement("meta");
        m.setAttribute(attr, key);
        return m;
    });
    el.setAttribute("content", content);
}

export function useRouteSeo(): void {
    const { pathname } = useLocation();
    const site = useSiteData();

    useEffect(() => {
        const route = findRoute(pathname);

        // An unrecognised path is the SPA catch-all. The Worker already marked
        // that response noindex; there is nothing useful to describe, so the
        // served tags are left exactly as they are.
        if (!route) return;

        const meta = route.meta(site);
        const canonical = absoluteUrl(route.path);

        // The tab gets the short form. The document arrived carrying the long,
        // descriptive title because that is what a search result shows — this
        // is the one place the two deliberately differ.
        document.title = meta.tabTitle;

        setMeta("name", "description", meta.description);
        setMeta("property", "og:title", site.seo.ogTitle || meta.title);
        setMeta("property", "og:description", site.seo.ogDescription || meta.description);
        setMeta("property", "og:url", canonical);

        upsert<HTMLLinkElement>('link[rel="canonical"]', () => {
            const l = document.createElement("link");
            l.rel = "canonical";
            return l;
        }).href = canonical;
    }, [pathname, site]);
}
