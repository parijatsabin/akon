/**
 * Renders the <head> tags for a route as an HTML string.
 *
 * This is the server half of the SEO work. It exists as a string builder
 * rather than DOM calls because the Worker has no DOM: it streams the built
 * index.html through HTMLRewriter and appends this markup. The browser half
 * (useRouteSeo) sets the equivalent tags through the DOM on client-side
 * navigation, where no new document is fetched.
 *
 * Order matters for nothing here, but escaping does — every value below is
 * CMS-editable, so an unescaped quote in a product name would break out of the
 * content attribute and corrupt the markup.
 */

import type { SiteData } from "../data/types";
import { absoluteUrl, SITE_ORIGIN } from "./routes";
import type { RouteMeta } from "./routes";
import { buildJsonLd } from "./structuredData";

/** Attribute-safe. Covers the five characters that can escape a quoted value. */
function escapeAttr(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

/**
 * JSON inside <script> needs `<` neutralised, otherwise a "</script>" in any
 * CMS field ends the block early and the rest of the JSON lands in the page as
 * visible text.
 */
function escapeJson(value: string): string {
    return value.replace(/</g, "\u003c");
}

const meta = (name: string, content: string): string =>
    `<meta name="${name}" content="${escapeAttr(content)}">`;

const property = (name: string, content: string): string =>
    `<meta property="${name}" content="${escapeAttr(content)}">`;

/** Absolute, because a relative og:image resolves against the crawler's own
 *  host rather than the site's and the preview silently shows nothing. */
function absolutise(url: string): string {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${SITE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * Picks the image a shared link previews with.
 *
 * seo.ogImage is the brand's logo, so every link shared of this site — and in
 * this market that mostly means WhatsApp and Facebook — previewed as a logo
 * tile. On the pages that are about the product, the product's own photograph
 * is the one that gives someone a reason to tap. The CMS field stays the
 * fallback and still owns every other page.
 *
 * Written against a product passed in rather than a hardcoded field, so a
 * second product needs a route entry here and nothing else.
 */
function socialImage(path: string, site: SiteData): string {
    const isProductPage = path === "/" || path === "/fragrance";
    const productShot = site.featuredProduct?.images?.[0] ?? "";

    if (isProductPage && productShot) return absolutise(productShot);
    return absolutise(site.seo.ogImage);
}

export function renderHead(path: string, routeMeta: RouteMeta, site: SiteData): string {
    const canonical = absoluteUrl(path);
    const { seo, brand } = site;

    const ogImage = socialImage(path, site);

    const isHome = path === "/";

    const tags = [
        meta("description", routeMeta.description),

        // Tells search engines which URL is the real one. Both the apex and www
        // resolve, and the SPA fallback answers unknown paths with a 200, so
        // without this the same content is reachable at unlimited addresses.
        `<link rel="canonical" href="${escapeAttr(canonical)}">`,

        // max-image-preview:large is what allows a photo beside the result
        // rather than a thumbnail; the rest is the permissive default stated
        // explicitly so it survives a future robots.txt change.
        meta("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"),

        property("og:type", path === "/fragrance" ? "product" : "website"),
        property("og:site_name", brand.name),
        property("og:locale", "en_US"),
        property("og:url", canonical),
        // The CMS og fields describe the brand as a whole, so they are the
        // right social copy for the homepage and the wrong copy everywhere
        // else -- letting them win on every route would make all seven pages
        // share one preview, which is the duplication this work set out to fix.
        property("og:title", (isHome && seo.ogTitle) || routeMeta.title),
        property("og:description", (isHome && seo.ogDescription) || routeMeta.description),

        // Twitter falls back to Open Graph for everything except the card type,
        // so only the tag that has no OG equivalent is worth emitting.
        meta("twitter:card", ogImage ? "summary_large_image" : "summary"),
    ];

    if (ogImage) {
        tags.push(property("og:image", ogImage));
        // Describes the image, not the page. routeMeta.title already ends in
        // the brand name, so interpolating it here read "ANOK - ... | ANOK".
        tags.push(property("og:image:alt", brand.tagline ? `${brand.name} — ${brand.tagline}` : brand.name));
    }

    const jsonLd = buildJsonLd(path, site);
    if (jsonLd) {
        tags.push(
            `<script type="application/ld+json">${escapeJson(JSON.stringify(jsonLd))}</script>`,
        );
    }

    return tags.join("\n  ");
}
