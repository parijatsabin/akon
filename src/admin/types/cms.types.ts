// ============================================================
// CMS Type Definitions — mirrors siteContent.ts structure.
// When moving to a backend API these become your request/response DTOs.
// ============================================================

export interface BusinessHour {
    day: string;
    time: string;
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
    hours: BusinessHour[];
    socialLinks: SocialLinks;
    mapEmbed: string;
}

export interface NavLink {
    label: string;
    href: string;
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
}

export interface StatItem {
    value: string;
    label: string;
}

export interface AboutData {
    sectionLabel: string;
    headline: string;
    body: string;
    cta: CtaButton;
    whyHeadline: string;
    whyTagline: string;
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
}

export interface CollectionData {
    headline: string;
    items: ProductItem[];
}

export interface TestimonialItem {
    id: number;
    quote: string;
    author: string;
    title: string;
    rating: number;
}

export interface TestimonialsData {
    headline: string;
    items: TestimonialItem[];
}

export interface CommitmentData {
    headline: string;
    body: string;
    cta: CtaButton;
}

export interface NewsletterData {
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
    navColumns: FooterNavColumn[];
    credit: { label: string; href: string };
}

// ── Root document ─────────────────────────────────────────────
export interface SiteData {
    brand: BrandData;
    navLinks: NavLink[];
    hero: HeroData;
    stats: StatItem[];
    about: AboutData;
    collection: CollectionData;
    testimonials: TestimonialsData;
    commitment: CommitmentData;
    newsletter: NewsletterData;
    footer: FooterData;
}
