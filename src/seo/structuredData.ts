/**
 * JSON-LD structured data.
 *
 * Meta tags tell a crawler how to *describe* a page; structured data tells it
 * what the page *is*. That distinction is what unlocks rich results — the
 * price and availability shown beside a product listing, the expandable
 * question list under an FAQ — and those are won on a new domain long before
 * it can compete for a head term like "best perfumes in Nepal".
 *
 * Emitted by the edge Worker into the served HTML. It is not emitted again on
 * the client: crawlers read the delivered document, and injecting a second
 * copy during SPA navigation would only risk duplicates in the same DOM.
 *
 * Every builder returns null when the data behind it is missing. A half-filled
 * graph is worse than none — Google reports incomplete entities as errors in
 * Search Console and ignores the result.
 */

import type { SiteData } from "../data/types";
import { SITE_ORIGIN, absoluteUrl } from "./routes";

/** Schema.org objects are open-ended by nature; this is the honest shape. */
type JsonLd = Record<string, unknown>;

/**
 * Prices are stored as display strings ("Rs. 4,500", "NPR 4500"), because that
 * is what the product section renders. schema.org/Offer needs a bare number
 * and a currency code, so the digits are lifted out.
 *
 * Currency defaults to NPR: the brand sells in Nepal, and a wrong-but-absent
 * currency invalidates the whole Offer while a wrong-but-present one is at
 * least correctable. If a second market is added this must become explicit.
 */
function parsePrice(raw: string): { price: string; currency: string } | null {
    const digits = raw.replace(/[^\d.]/g, "");
    if (!digits || !Number.isFinite(Number(digits))) return null;
    const currency = /usd|\$/i.test(raw) ? "USD" : "NPR";
    return { price: String(Number(digits)), currency };
}

/** CMS answers may contain markup; schema.org wants readable text. */
function toPlainText(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Relative CMS image paths must be absolute before a crawler can fetch them. */
function absoluteAsset(url: string): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${SITE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function organization({ brand }: SiteData): JsonLd {
    const sameAs = brand.socialLinks.map((l) => l.url).filter(Boolean);
    const logo = absoluteAsset("/logo.png");

    return {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#organization`,
        name: brand.name,
        url: `${SITE_ORIGIN}/`,
        ...(brand.shortDescription ? { description: brand.shortDescription } : {}),
        ...(logo ? { logo } : {}),
        ...(brand.email ? { email: brand.email } : {}),
        ...(brand.phone ? { telephone: brand.phone } : {}),
        // addressCountry is the one part known without a CMS field: the brand
        // is Nepali. Locality comes from the CMS when it is filled in.
        address: {
            "@type": "PostalAddress",
            addressCountry: "NP",
            ...(brand.location ? { addressLocality: brand.location } : {}),
        },
        ...(sameAs.length > 0 ? { sameAs } : {}),
    };
}

function website({ brand }: SiteData): JsonLd {
    return {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: brand.name,
        inLanguage: "en",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    };
}

function product({ brand, featuredProduct: p }: SiteData): JsonLd | null {
    if (!p?.name) return null;

    const image = p.images.map(absoluteAsset).filter((u): u is string => Boolean(u));
    const priced = parsePrice(p.price);

    return {
        "@type": "Product",
        "@id": `${SITE_ORIGIN}/#product`,
        name: p.name,
        ...(p.description ? { description: toPlainText(p.description) } : {}),
        ...(image.length > 0 ? { image } : {}),
        brand: { "@type": "Brand", name: brand.name },
        ...(p.collection ? { category: p.collection } : {}),
        // Only claim an offer when there is a real number behind it. An Offer
        // with a missing price is an invalid entity, not a partial one.
        ...(priced
            ? {
                  offers: {
                      "@type": "Offer",
                      url: absoluteUrl("/"),
                      price: priced.price,
                      priceCurrency: priced.currency,
                      availability: "https://schema.org/InStock",
                      seller: { "@id": `${SITE_ORIGIN}/#organization` },
                  },
              }
            : {}),
    };
}

function faqPage({ faq }: SiteData): JsonLd | null {
    const items = faq.items.filter((i) => i.question && i.answer);
    if (items.length === 0) return null;

    return {
        "@type": "FAQPage",
        "@id": `${absoluteUrl("/faq")}#faq`,
        mainEntity: items.map((i) => ({
            "@type": "Question",
            name: toPlainText(i.question),
            acceptedAnswer: { "@type": "Answer", text: toPlainText(i.answer) },
        })),
    };
}

/**
 * One @graph per page rather than several separate scripts, so the entities
 * can reference each other by @id — the Product's seller and the WebSite's
 * publisher both resolve to the single Organization node.
 */
export function buildJsonLd(path: string, site: SiteData): JsonLd | null {
    const nodes: JsonLd[] = [organization(site), website(site)];

    // The product is presented and bought on the homepage, and /fragrance is
    // its detail page. Those are the only two pages that are *about* it.
    if (path === "/" || path === "/fragrance") {
        const p = product(site);
        if (p) nodes.push(p);
    }

    if (path === "/faq") {
        const f = faqPage(site);
        if (f) nodes.push(f);
    }

    return nodes.length > 0 ? { "@context": "https://schema.org", "@graph": nodes } : null;
}
