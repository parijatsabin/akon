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

export function renderHead(path: string, routeMeta: RouteMeta, site: SiteData): string {
    const canonical = absoluteUrl(path);
    const { seo, brand } = site;

    // og:image must be absolute — a relative path resolves against the
    // crawler's own host, not the site's, and the preview silently shows nothing.
    const ogImage = seo.ogImage
        ? /^https?:\/\//i.test(seo.ogImage)
            ? seo.ogImage
            : `${SITE_ORIGIN}${seo.ogImage.startsWith("/") ? "" : "/"}${seo.ogImage}`
        : "";

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
