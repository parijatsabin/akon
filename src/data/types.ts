// ============================================================
// CMS type definitions.
//
// This is the contract between the database and the UI: get_site_data()
// returns exactly this shape, and every key here maps to a row in
// site_content, or to the company / products table.
//
// Navigation is deliberately absent. The navbar and footer links point at
// fixed routes and are constants in Navbar.tsx / Footer.tsx.
// ============================================================

export interface BusinessHour {
    day: string;
    isClosed: boolean;
    openTime: string;
    closeTime: string;
}

/** Platforms the CMS can offer; icons live in components/SocialLinks.tsx. */
export type SocialPlatform =
    | "instagram" | "facebook" | "pinterest" | "x"
    | "linkedin" | "youtube" | "tiktok" | "whatsapp";

/**
 * A list rather than a fixed object, so platforms can be added and removed in
 * the CMS instead of requiring a schema and code change for each one.
 */
export interface SocialLink {
    platform: SocialPlatform;
    url: string;
}

export interface BrandData {
    name: string;
    tagline: string;
    shortDescription: string;
    location: string;
    phone: string;
    phoneDisplay: string;
    email: string;
    useDefaultTime: boolean;
    hours: BusinessHour[];
    socialLinks: SocialLink[];
    mapEmbed: string;
}

export interface CtaButton {
    label: string;
    href: string;
}

export interface HeroData {
    smallLabel: string;
    smallLabelHighlight: string;
    mainHeading: string;
    description: string;
    ctaPrimary: CtaButton;
    ctaSecondary: CtaButton;
    /** Looping background video. Takes precedence over backgroundImage. */
    videoUrl: string;
    /** Still fallback, used when videoUrl is blank. */
    backgroundImage: string;
}

export interface AboutData {
    sectionLabel: string;
    headline: string;
    body: string;
    bodyExtended: string;
    brandQuote: string;
    cta: CtaButton;
    whyHeadline: string;
    whyTagline: string;
    differenceSectionTag: string;
    ctaStripTag: string;
    ctaStripHeading: string;
    /** Background photo behind the closing CTA strip. Empty string = flat colour. */
    ctaStripImage: string;
    reasons: ReasonItem[];
}

export interface ReasonItem {
    id: string;
    title: string;
    body: string;
}

/** One tier of the fragrance pyramid: what is in it, and how it reads. */
export interface NoteLayer {
    ingredients: string[];
    impression: string;
}

export interface FragranceNotes {
    top: NoteLayer;
    heart: NoteLayer;
    base: NoteLayer;
}

/** A short selling point shown as a card above the fold. */
export interface ProductHighlight {
    id: string;
    title: string;
    body: string;
}

/** One row of the specification table. */
export interface ProductSpec {
    label: string;
    value: string;
}

/** One numbered step in the "How to Wear It" guidance. */
export interface UsageStep {
    id: string;
    title: string;
    body: string;
}

export interface ProductItem {
    id: string;
    name: string;
    /** The line this fragrance belongs to, e.g. "Signature Collection" */
    collection: string;
    /** Concentration, e.g. "Eau de Parfum (EDP)" */
    concentration: string;
    /** Headline bottle size shown beside the price, e.g. "100 mL / 3.4 fl. oz." */
    headlineSize: string;
    /** Short lead paragraph shown at the top of the section. */
    tagline: string;
    notes: FragranceNotes;
    description: string;
    price: string;
    /** Gallery. The first entry is the default view. Never empty. */
    images: string[];
    /** Bottle sizes offered, e.g. ["100 ml", "50 ml"] */
    sizes: string[];
    highlights: ProductHighlight[];
    specs: ProductSpec[];
    usage: UsageStep[];
    /** Informational ordering/returns note. Empty string hides the block. */
    orderingNote: string;
}

export interface TestimonialItem {
    /**
     * A uuid from the database. Was a number when content lived in a JSON file
     * that people hand-edited; it is only ever used as a React key.
     */
    id: string;
    quote: string;
    author: string;
    title: string;
    rating: number;
    /** Whether the testimonial is visible on the public site */
    visible: boolean;
    /** Display order (lower = shown first) */
    order: number;
}

export interface TestimonialsData {
    sectionTag: string;
    headline: string;
    items: TestimonialItem[];
}

export interface CommitmentData {
    tag: string;
    headline: string;
    body: string;
    cta: CtaButton;
    /** Section photo. Empty string = the original centred, text-only layout. */
    imageUrl: string;
    pillars: CommitmentPillar[];
}

export interface CommitmentPillar {
    id: string;
    icon: string;
    title: string;
    body: string;
}

export interface NewsletterData {
    eyebrow: string;
    headline: string;
    brandHighlight: string;
    subtext: string;
    placeholder: string;
    cta: string;
    /** Background photo behind the dark newsletter band. Empty string = flat colour. */
    backgroundImage: string;
}

export interface FooterData {
    tagline: string;
    hoursHeading: string;
    credit: { label: string; href: string };
}

// ── SEO ───────────────────────────────────────────────────────
export interface SeoData {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
    ogImage: string;
    ogTitle: string;
    ogDescription: string;
}

// ── Contact page ──────────────────────────────────────────────
export interface ContactData {
    pageTag: string;
    pageSubtitle: string;
    subjects: string[];
}

// ── Policy pages (Privacy, Terms) ─────────────────────────────
export interface PolicySection {
    id: string;
    heading: string;
    /** Plain text. Blank lines separate paragraphs. */
    body: string;
}

export interface PolicyPageData {
    title: string;
    intro: string;
    /** Free text, e.g. "15 August 2026" — shown under the title. */
    lastUpdated: string;
    sections: PolicySection[];
}

// ── FAQ ───────────────────────────────────────────────────────
export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FaqData {
    title: string;
    intro: string;
    items: FaqItem[];
}

// ── Root document ─────────────────────────────────────────────
export interface SiteData {
    brand: BrandData;
    hero: HeroData;
    about: AboutData;
    /** The single flagship product V1 is built around */
    featuredProduct: ProductItem;
    testimonials: TestimonialsData;
    commitment: CommitmentData;
    newsletter: NewsletterData;
    footer: FooterData;
    contact: ContactData;
    privacy: PolicyPageData;
    terms: PolicyPageData;
    faq: FaqData;
    seo: SeoData;
}
