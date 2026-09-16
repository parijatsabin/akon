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
            title: `Buy Himalayan-Inspired Unisex Perfume Online in Nepal | ${brand.name}`,
            description: oneLine(`
                Buy authentic, long-lasting unisex Eau de Parfum online in Nepal.
                Handcrafted by ${brand.name} with Himalayan notes. Free delivery in
                Kathmandu Valley and nationwide shipping.`),
            tabTitle: brand.name,
        }),
    },
    {
        path: "/fragrance",
        priority: 0.9,
        changefreq: "monthly",
        meta: ({ brand, featuredProduct: p }) => ({
            title: p.concentration
                ? `${p.name} — ${p.concentration} Nepal | Notes & Price | ${brand.name}`
                : `${p.name} — Authentic Himalayan EDP in Nepal | ${brand.name}`,
            description: oneLine(`
                Explore ${p.name} Eau de Parfum by ${brand.name}. Discover top, heart
                and base notes, longevity guide, full ingredients, and authentic perfume
                pricing in Nepal.`),
            tabTitle: `${brand.name} · ${p.name}`,
        }),
    },
    {
        path: "/about",
        priority: 0.8,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            title: `Authentic Nepali Fragrance House — About Us | ${brand.name}`,
            description: oneLine(`
                The story behind ${brand.name} — how an authentic Nepali perfume brand
                creates artisanal, long-lasting fragrances inspired by Himalayan
                botanicals and mindful presence.`),
            tabTitle: `${brand.name} · About`,
        }),
    },
    {
        path: "/contact",
        priority: 0.7,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            title: `Contact & Boutique in Kathmandu | ${brand.name} Perfumes Nepal`,
            description: oneLine(`
                Get in touch with ${brand.name} in ${MARKET}. Boutique location,
                fragrance consultations, festival gifting orders, and delivery across
                Kathmandu, Pokhara, Chitwan and nationwide.`),
            tabTitle: `${brand.name} · Contact`,
        }),
    },
    {
        path: "/faq",
        priority: 0.7,
        changefreq: "monthly",
        meta: ({ brand }) => ({
            title: `Perfume Buying & Longevity FAQ Nepal | ${brand.name}`,
            description: oneLine(`
                Common questions about perfume longevity in Nepal's climate, EDP vs EDT
                concentration, authenticity guarantees, Cash on Delivery, and delivery
                timelines by ${brand.name}.`),
            tabTitle: `${brand.name} · FAQ`,
        }),
    },
    {
        // Not in the sitemap and not indexable: it is a form, reached from a
        // message or a QR code rather than from a search result. It is listed
        // here anyway because that is what gives the Worker a title, a
        // description and an og:image to render — a route missing from this
        // file is served with the bare index.html head, and the link would
        // preview as nothing at all.
        path: "/review",
        priority: 0.1,
        changefreq: "yearly",
        noindex: true,
        meta: ({ brand, featuredProduct: p }) => ({
            title: `Share Your Experience | ${brand.name}`,
            description: oneLine(`
                Tell us how ${p.name} wears for you. Your review is read before it
                is published, and your email is never shown on the site.`),
            tabTitle: `${brand.name} · Write a Review`,
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
