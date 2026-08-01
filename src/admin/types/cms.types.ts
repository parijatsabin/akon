// ============================================================
// CMS Type Definitions — mirrors siteContent.ts structure.
// When moving to a backend API these become your request/response DTOs.
// ============================================================

export interface BusinessHour {
    day: string;
    isClosed: boolean;
    openTime: string;
    closeTime: string;
}

export interface SocialLinks {
    instagram: string;
    facebook: string;
    pinterest: string;
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
    socialLinks: SocialLinks;
    mapEmbed: string;
}

export interface NavLink {
    label: string;
    href: string;
    /** When false the link is hidden in the navbar but the page remains accessible */
    enabled: boolean;
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
    videoUrl: string;
}

export interface StatItem {
    value: string;
    label: string;
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
    reasons: ReasonItem[];
}

export interface ReasonItem {
    id: string;
    title: string;
    body: string;
}

export interface FragranceNotes {
    top: string[];
    heart: string[];
    base: string[];
}

export interface ProductItem {
    id: string;
    name: string;
    collection: string;
    notes: FragranceNotes;
    description: string;
    price: string;
    badge: string | null;
    accentColor: string;
    imageUrl: string;
    productUrl: string;
    /** Whether the product is visible on the public site */
    visible: boolean;
    /** Display order (lower = shown first) */
    order: number;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface ShippingRow {
    label: string;
    value: string;
}

export interface TrustSignal {
    icon: string;
    text: string;
}

export interface CollectionData {
    sectionTag: string;
    headline: string;
    pageTag: string;
    pageSubtitle: string;
    ctaExploreLabel: string;
    items: ProductItem[];
    productSizes: string[];
    shippingRows: ShippingRow[];
    craftsmanshipText: string[];
    trustSignals: TrustSignal[];
}

export interface TestimonialItem {
    id: number;
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
}

export interface FooterNavLink {
    label: string;
    href: string;
}

export interface FooterNavColumn {
    heading: string;
    links: FooterNavLink[];
}

export interface FooterData {
    tagline: string;
    hoursHeading: string;
    navColumns: FooterNavColumn[];
    credit: { label: string; href: string };
}

// ── Collection tile (homepage category showcase) ──────────────
export interface CollectionTileItem {
    id: string;
    label: string;
    heading: string;
    subtext: string;
    href: string;
    imageUrl: string;
    /** Whether the tile is shown on the homepage */
    visible: boolean;
    /** Display order (lower = shown first) */
    order: number;
}

export interface CollectionTilesSection {
    sectionTag: string;
    headline: string;
    items: CollectionTileItem[];
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

// ── Root document ─────────────────────────────────────────────
export interface SiteData {
    brand: BrandData;
    navLinks: NavLink[];
    mobileCtaLabel: string;
    hero: HeroData;
    stats: StatItem[];
    about: AboutData;
    /** The single flagship product shown in the Signature Collection homepage section */
    featuredProduct: ProductItem;
    /** Full product catalog — managed separately, shown on /products page */
    collection: CollectionData;
    /** Homepage collection category showcase tiles */
    collectionTiles: CollectionTilesSection;
    testimonials: TestimonialsData;
    commitment: CommitmentData;
    newsletter: NewsletterData;
    footer: FooterData;
    contact: ContactData;
    seo: SeoData;
}
