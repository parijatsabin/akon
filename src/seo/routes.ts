/**
 * Route-level SEO — one primary target phrase per public route.
 *
 * WHY THIS FILE EXISTS: the site shipped a single SeoData record shared by
 * every page, so /about, /contact, /faq, /privacy and /terms all presented the
 * homepage's title and description. Search engines treat that as five
 * near-duplicate pages and pick one to rank, which wastes the pages that were
 * written to answer different questions. A page can only rank for a phrase it
 * actually says, so each route gets its own.
 *
 * It is imported by BOTH the browser bundle and the edge Worker, which is the
 * reason it holds no DOM and no React: worker/index.ts renders these strings
 * into the HTML before it leaves Cloudflare, and useRouteSeo() re-applies them
 * on client-side navigation. Two renderers, one set of strings.
 *
 * The copy below is a starting point built from the brand's own keyword list.
 * It is deliberately plain constants rather than CMS fields: a title is edited
 * a few times a year and changing it should be reviewable in a diff.
 */

import type { SiteData } from "../data/types";

/**
 * The canonical origin. Every generated URL — canonical tags, Open Graph,
 * sitemap, JSON-LD — derives from this one constant, and the Worker also uses
 * it to decide which hostname to redirect away from. Both apex and www serve
 * the site, so without a single answer here the two would compete as duplicates.
 */
export const SITE_ORIGIN = "https://anokperfumes.com.np";

export interface RouteMeta {
    /**
     * The <title> and og:title — written for a search result and a link
     * preview, where a descriptive phrase earns its length.
     */
    title: string;
    /** ~155 characters. Longer is truncated in results, shorter wastes the space. */
    description: string;
    /**
     * The browser tab, which is a few dozen pixels shared with every other open
     * tab and wants the shortest thing that identifies the page. The server
     * renders `title` because that is what crawlers read; the client swaps in
     * this shorter form once React mounts.
     */
    tabTitle: string;
}

export interface RouteDef {
    path: string;
    /** Sitemap <priority>, relative within this site only. */
    priority: number;
    changefreq: "weekly" | "monthly" | "yearly";
    /** Kept out of the sitemap and marked noindex — thin or legal boilerplate. */
    noindex?: boolean;
    meta: (site: SiteData) => RouteMeta;
}

/**
 * The city these pages are written to rank in, kept separate from the CMS
 * address field so that titles stay short. Change it here if the brand's
 * market changes -- it is a search target, not a postal fact.
 */
const MARKET = "Kathmandu, Nepal";

/** Collapses whitespace so template literals can be written across lines. */
const oneLine = (s: string): string => s.replace(/\s+/g, " ").trim();

export const ROUTES: RouteDef[] = [
    {
        path: "/",
        priority: 1.0,
        changefreq: "weekly",
        meta: ({ brand }) => ({
            title: `Himalayan-Inspired Unisex Perfume in Nepal | ${brand.name}`,
            description: oneLine(`
                ${brand.name} is a Nepali perfume brand drawing on Himalayan character —
                a long-lasting unisex eau de parfum made for self-care, confidence
                and quiet everyday presence.`),
            tabTitle: brand.name,
        }),
    },
    {
        path: "/fragrance",
        priority: 0.9,
        changefreq: "monthly",
        meta: ({ brand, featuredProduct: p }) => ({
            // The concentration is the honest category term ("Eau de Parfum"),
            // and it is also what people type. Falls back when the CMS field is
            // blank rather than leaving a dangling dash.
            title: p.concentration
                ? `${p.name} — ${p.concentration} | ${brand.name}`
                : `${p.name} — Fragrance Details | ${brand.name}`,
            description: oneLine(`
                Fragrance notes, full ingredient list, specifications and wearing
                guidance for ${p.name}, the unisex signature fragrance from
                ${brand.name} in Nepal.`),
            tabTitle: `${brand.name} · ${p.name}`,
        }),
    },
    {
        path: "/about",
        priority: 0.8,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            title: `Nepali Perfume Brand Inspired by the Himalayas | ${brand.name}`,
            description: oneLine(`
                The story behind ${brand.name} — why a fragrance made in Nepal is
                built around mindful self-care, and what goes into every bottle.`),
            tabTitle: `${brand.name} · About`,
        }),
    },
    {
        path: "/contact",
        priority: 0.7,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            // MARKET, not brand.location. The CMS field holds a full postal
            // address ("Dhumbarahi, Kathmandu 44600, Nepal"), which pushed this
            // title past the width a search result renders and truncated the
            // part that matters. The address still belongs on the page and in
            // the JSON-LD; a title wants the city alone.
            title: `Contact ${brand.name} — Perfume in ${MARKET}`,
            description: oneLine(`
                Get in touch with ${brand.name} in ${MARKET} about the fragrance,
                orders and availability.`),
            tabTitle: `${brand.name} · Contact`,
        }),
    },
    {
        path: "/faq",
        priority: 0.7,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            title: `Perfume FAQ — Longevity, Care & Authenticity | ${brand.name}`,
            description: oneLine(`
                Common questions about ${brand.name} fragrance: how long it lasts,
                how to store and wear it, ingredient safety, and buying in Nepal.`),
            tabTitle: `${brand.name} · FAQ`,
        }),
    },
    {
        path: "/privacy",
        priority: 0.2,
        changefreq: "yearly",
        meta: ({ brand }) => ({
            title: `Privacy Policy | ${brand.name}`,
            description: `How ${brand.name} collects, uses and protects your personal information.`,
            tabTitle: `${brand.name} · Privacy`,
        }),
    },
    {
        path: "/terms",
        priority: 0.2,
        changefreq: "yearly",
        meta: ({ brand }) => ({
            title: `Terms & Conditions | ${brand.name}`,
            description: `The terms that apply when you use the ${brand.name} website.`,
            tabTitle: `${brand.name} · Terms`,
        }),
    },
];

/**
 * Exact-match only. A path that is not a declared route is either the SPA
 * catch-all or a typo; both are served the homepage shell by
 * not_found_handling, and neither should be told it is the homepage — that is
 * how a site ends up with hundreds of indexed duplicate URLs.
 */
export function findRoute(pathname: string): RouteDef | undefined {
    const normalised = pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname;
    return ROUTES.find((r) => r.path === normalised);
}

/** Absolute URL for a route path, used for canonical, og:url and the sitemap. */
export function absoluteUrl(pathname: string): string {
    return pathname === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${pathname}`;
}
