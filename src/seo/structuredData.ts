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

import type { SiteData, TestimonialItem } from "../data/types";
import { SITE_ORIGIN, absoluteUrl } from "./routes";

/**
 * Delivery, as the brand actually runs it: free inside the Kathmandu valley,
 * a flat fee everywhere else in Nepal. schema.org wants a number, so the
 * outside-valley entry is only emitted once the real rate is filled in here —
 * an invented figure in an OfferShippingDetails is a price commitment Google
 * checks against the checkout, and a missing entry is the safer half-truth.
 */
const SHIPPING = {
    /** NPR. Set to the real flat rate to publish the outside-valley entry. */
    outsideValleyRate: null as number | null,
    /** Business days spent packing before it is handed to the courier. */
    handlingDays: [1, 2] as [number, number],
    transitDaysValley: [1, 2] as [number, number],
    transitDaysNepal: [2, 5] as [number, number],
};

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
    // The first number in the string, thousands separators and decimals
    // included. Stripping every non-digit instead kept the full stop in the
    // "Rs." prefix, and "Rs. 4,500" was published to Google as 0.45.
    const match = raw.match(/\d[\d,]*(?:\.\d+)?/);
    const digits = match ? match[0].replace(/,/g, "") : "";
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

/**
 * `withOffer` and `withReviews` each track whether the thing being marked up is
 * actually rendered on the page being described. Google requires both a price
 * and a review to be visible to the reader, and the two pages differ:
 *
 *   /           shows the price, no reviews  -> Offer, no aggregateRating
 *   /fragrance  shows reviews, no price      -> aggregateRating, no Offer
 *
 * The homepage carried review markup until the testimonials carousel was taken
 * off it. Leaving the markup behind would have been a claim the page no longer
 * backs up, which is the kind of thing that earns a manual action rather than a
 * warning.
 */
function product(site: SiteData, withOffer: boolean, withReviews: boolean): JsonLd | null {
    const { brand, featuredProduct: p } = site;
    if (!p?.name) return null;

    const image = p.images.map(absoluteAsset).filter((u): u is string => Boolean(u));
    const priced = parsePrice(p.price);

    // Rounded to one decimal because that is how a rating reads; Google
    // rejects an aggregateRating whose reviewCount is zero.
    const voices = withReviews ? publishedTestimonials(site) : [];
    const rated = voices.length > 0
        ? {
              aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: (
                      voices.reduce((sum, t) => sum + t.rating, 0) / voices.length
                  ).toFixed(1),
                  reviewCount: voices.length,
                  bestRating: "5",
                  worstRating: "1",
              },
              review: reviews(voices),
          }
        : {};

    return {
        "@type": "Product",
        "@id": `${SITE_ORIGIN}/#product`,
        name: p.name,
        ...(p.description ? { description: toPlainText(p.description) } : {}),
        ...(image.length > 0 ? { image } : {}),
        brand: { "@type": "Brand", name: brand.name },
        ...(p.collection ? { category: p.collection } : {}),
        ...rated,
        // Only claim an offer when there is a real number behind it. An Offer
        // with a missing price is an invalid entity, not a partial one.
        ...(priced && withOffer
            ? {
                  offers: {
                      "@type": "Offer",
                      url: absoluteUrl("/"),
                      price: priced.price,
                      priceCurrency: priced.currency,
                      availability: "https://schema.org/InStock",
                      seller: { "@id": `${SITE_ORIGIN}/#organization` },
                      hasMerchantReturnPolicy: returnPolicy(),
                      shippingDetails: shippingDetails(priced.currency),
                  },
              }
            : {}),
    };
}

/**
 * Reviews shown on the page, as schema.org objects.
 *
 * These are the CMS testimonials — the same ones the reader sees in the
 * carousel on this page. Google will not accept review markup for text that is
 * not visible where the markup sits, which is why the carousel now renders on
 * the homepage and /fragrance as well as /about.
 */
function reviews(items: TestimonialItem[]): JsonLd[] {
    return items.map((t) => ({
        "@type": "Review",
        reviewRating: {
            "@type": "Rating",
            ratingValue: String(t.rating),
            bestRating: "5",
            worstRating: "1",
        },
        author: { "@type": "Person", name: t.author },
        reviewBody: toPlainText(t.quote),
    }));
}

/** Only the testimonials the CMS actually publishes, in display order. */
function publishedTestimonials({ testimonials }: SiteData): TestimonialItem[] {
    return testimonials.items
        .filter((t) => t.visible && t.author && t.quote && t.rating >= 1 && t.rating <= 5)
        .sort((a, b) => a.order - b.order);
}

/**
 * Merchant listing fields. Both are conditions of the sale rather than
 * properties of the bottle, so they hang off the Offer and are emitted only
 * where an Offer is — the homepage.
 *
 * Returns are not accepted: a perfume leaves sealed and comes back unsellable.
 * MerchantReturnNotPermitted is the honest category, and it satisfies the
 * requirement as completely as a 30-day window would.
 */
function returnPolicy(): JsonLd {
    return {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "NP",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    };
}

function shippingDetails(currency: string): JsonLd[] {
    const handling = {
        "@type": "QuantitativeValue",
        minValue: SHIPPING.handlingDays[0],
        maxValue: SHIPPING.handlingDays[1],
        unitCode: "DAY",
    };
    const transit = (range: [number, number]) => ({
        "@type": "QuantitativeValue",
        minValue: range[0],
        maxValue: range[1],
        unitCode: "DAY",
    });

    const entry = (rate: number, region: string | null, transitDays: [number, number]): JsonLd => ({
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: rate, currency },
        shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "NP",
            ...(region ? { addressRegion: region } : {}),
        },
        deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: handling,
            transitTime: transit(transitDays),
        },
    });

    // "Bagmati" is the province the valley sits in — the coarsest region code
    // schema.org accepts here, and the closest honest fit for "free inside
    // Kathmandu". The paid entry covers the rest of the country.
    const list = [entry(0, "Bagmati", SHIPPING.transitDaysValley)];
    if (SHIPPING.outsideValleyRate !== null) {
        list.push(entry(SHIPPING.outsideValleyRate, null, SHIPPING.transitDaysNepal));
    }
    return list;
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
        // Only the homepage renders the price, and only /fragrance renders the
        // reviews. Each page claims what it shows.
        const p = product(site, path === "/", path === "/fragrance");
        if (p) nodes.push(p);
    }

    if (path === "/faq") {
        const f = faqPage(site);
        if (f) nodes.push(f);
    }

    return nodes.length > 0 ? { "@context": "https://schema.org", "@graph": nodes } : null;
}
