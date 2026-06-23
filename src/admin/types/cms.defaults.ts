/**
 * Default site data — exact mirror of the original siteContent.ts.
 * This is the fallback when localStorage has no saved data yet.
 */
import type { SiteData } from "./cms.types";

export const DEFAULT_SITE_DATA: SiteData = {
    brand: {
        name: "ANOK",
        tagline: "Where luxury meets the art of fragrance",
        shortDescription:
            "ANOK is a Kathmandu-born house of fragrance — composing rare, slow-crafted perfumes that hold time, memory and the quiet weight of luxury.",
        location: "Maharajgunj Chakrapath, Kathmandu, Nepal",
        phone: "+977 9868765432",
        phoneDisplay: "+977 9868 765 432",
        email: "hello@anok.fragrance",
        useDefaultTime: true,
        hours: [
            { day: "Sunday", isClosed: true, openTime: "09:00", closeTime: "17:00" },
            { day: "Monday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
            { day: "Tuesday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
            { day: "Wednesday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
            { day: "Thursday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
            { day: "Friday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
            { day: "Saturday", isClosed: false, openTime: "09:00", closeTime: "17:00" },
        ],
        socialLinks: {
            instagram: "https://instagram.com/anok",
            facebook: "https://facebook.com/anok",
            pinterest: "https://pinterest.com/anok",
        },
        mapEmbed:
            "https://www.google.com/maps?q=Maharajgunj+Chakrapath,+Kathmandu,+Nepal&output=embed",
    },

    navLinks: [
        { label: "Home", href: "#home" },
        { label: "Collection", href: "#collection" },
        { label: "Reviews", href: "#reviews" },
        { label: "Contact", href: "#contact" },
    ],

    hero: {
        smallLabel: "LUXURY &",
        smallLabelHighlight: "PREMIUM",
        mainHeading: "Revel The Beauty\nInside You",
        description:
            "Timeless Fragrances, Crafted With Passion, Embody Individuality, Elegance, And Sophistication, Leaving A Lasting Impression Always.",
        ctaPrimary: { label: "Explore Collection", href: "#collection" },
        ctaSecondary: { label: "Our Story", href: "#about" },
    },

    stats: [
        { value: "140+", label: "Products Available" },
        { value: "1M+", label: "Sales Already" },
        { value: "80+", label: "Industrial Franchises" },
        { value: "1.01m", label: "Connections" },
    ],

    about: {
        sectionLabel: '"Our Legacy Of Luxury"',
        headline: "About Us",
        body: "ANOK is a Kathmandu-born house of fragrance — composing rare, slow-crafted perfumes that hold time, memory and the quiet weight of luxury.",
        cta: { label: "Learn More", href: "#contact" },
        whyHeadline: "Why Choose Us",
        whyTagline: "Luxury redefined—crafted for the exceptional.",
        reasons: [
            {
                id: "01",
                title: "Artistic Design",
                body: "Every fragrance is a masterpiece, crafted with precision by world-class perfumers.",
            },
            {
                id: "02",
                title: "Organic Ingredients",
                body: "Sourced from nature's finest, each note embodies pure sophistication.",
            },
            {
                id: "03",
                title: "Sustainable Elegance",
                body: "Indulge guilt-free with fragrances designed to honour the planet.",
            },
            {
                id: "04",
                title: "Exclusive Collections",
                body: "Discover scents as rare and unique as the moments they inspire.",
            },
        ],
    },

    collection: {
        headline: "Featured Collection",
        items: [
            {
                id: "noir-veil",
                name: "Noir Veil",
                collection: "Signature Collection",
                notes: {
                    top: ["Bergamot", "Pink Pepper"],
                    heart: ["Bulgarian Rose", "Iris"],
                    base: ["Oud", "Amber"],
                },
                description:
                    "A nocturnal composition built on aged oud and Bulgarian rose — quiet, deliberate, unmistakably ANOK.",
                price: "NPR 24,500",
                badge: null,
                accentColor: "#1a1a1a",
                imageUrl:
                    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "espresso-rouge",
                name: "Espresso Rouge",
                collection: "Luxury Collection",
                notes: {
                    top: ["Roasted Coffee", "Cardamom"],
                    heart: ["Tonka", "Cocoa Absolute"],
                    base: ["Vanilla", "Cashmeran"],
                },
                description:
                    "Velvety espresso wrapped in vanilla and cashmere woods — gourmand without sweetness.",
                price: "NPR 28,900",
                badge: "Best Seller",
                accentColor: "#3d2817",
                imageUrl:
                    "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "champagne-hour",
                name: "Champagne Hour",
                collection: "Signature Collection",
                notes: {
                    top: ["Champagne Accord", "Mandarin"],
                    heart: ["Jasmine Sambac", "Peach"],
                    base: ["White Musk", "Sandalwood"],
                },
                description:
                    "Effervescent jasmine and peach over white musk — the held breath before a celebration.",
                price: "NPR 22,000",
                badge: null,
                accentColor: "#f9e4e4",
                imageUrl:
                    "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "obsidian-no-7",
                name: "Obsidian No. 7",
                collection: "Limited Edition",
                notes: {
                    top: ["Black Pepper", "Saffron"],
                    heart: ["Leather", "Smoked Iris"],
                    base: ["Vetiver", "Patchouli"],
                },
                description:
                    "Smoked leather and vetiver in a faceted obsidian flacon. Numbered to 250 worldwide.",
                price: "NPR 42,000",
                badge: "Limited Edition",
                accentColor: "#222222",
                imageUrl:
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "kathmandu-bloom",
                name: "Kathmandu Bloom",
                collection: "Seasonal Fragrances",
                notes: {
                    top: ["Himalayan Rhododendron", "Yuzu"],
                    heart: ["Magnolia", "Lotus"],
                    base: ["White Tea", "Cedarwood"],
                },
                description:
                    "A spring ode to the valley in bloom — luminous florals over the cool of mountain cedar.",
                price: "NPR 19,800",
                badge: null,
                accentColor: "#e4f0f5",
                imageUrl:
                    "https://images.unsplash.com/photo-1588405748880-42d3054a1d71?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "solar-amber",
                name: "Solar Amber",
                collection: "Luxury Collection",
                notes: {
                    top: ["Neroli", "Bitter Orange"],
                    heart: ["Honey", "Beeswax Absolute"],
                    base: ["Labdanum", "Benzoin"],
                },
                description:
                    "Sun-warmed amber and honey suspended in neroli — golden, generous, slow to fade.",
                price: "NPR 26,400",
                badge: null,
                accentColor: "#f5e6c8",
                imageUrl:
                    "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "wild-iris",
                name: "Wild Iris",
                collection: "Signature Collection",
                notes: {
                    top: ["Violet Leaf", "Pear"],
                    heart: ["Iris", "Jasmine"],
                    base: ["Musk", "Cedar"],
                },
                description: "A fresh and elegant blend of wild iris and delicate jasmine.",
                price: "NPR 21,500",
                badge: null,
                accentColor: "#e0d5f0",
                imageUrl:
                    "https://images.unsplash.com/photo-1589733958979-162305875470?w=400&h=500&fit=crop",
                productUrl: "#",
            },
            {
                id: "coastal-breeze",
                name: "Coastal Breeze",
                collection: "Seasonal Fragrances",
                notes: {
                    top: ["Sea Salt", "Citrus"],
                    heart: ["Lavender", "Geranium"],
                    base: ["Driftwood", "Amber"],
                },
                description:
                    "A refreshing scent inspired by ocean breezes and sun-warmed driftwood.",
                price: "NPR 18,900",
                badge: null,
                accentColor: "#d4e8f5",
                imageUrl:
                    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop",
                productUrl: "#",
            },
        ],
    },

    testimonials: {
        headline: "What Our Customers Say",
        items: [
            {
                id: 1,
                quote:
                    "Noir Elixir is pure magic. The bold, seductive blend is perfect for evenings out, and I always receive compliments on it.",
                author: "Sophia L.",
                title: "Ceo Of Alpha Company",
                rating: 5,
            },
            {
                id: 2,
                quote:
                    "Celestial Blossom is my everyday signature. Light, feminine, and utterly elegant — it lasts all day beautifully.",
                author: "Amara K.",
                title: "Head of Design, Bloom Studio",
                rating: 5,
            },
            {
                id: 3,
                quote:
                    "The packaging alone is a work of art. Mystic Dawn has a depth that I have never experienced in any other fragrance.",
                author: "James R.",
                title: "Lifestyle Curator",
                rating: 5,
            },
        ],
    },

    commitment: {
        headline: "A Commitment To Purity",
        body: "We believe in sustainable luxury. Every bottle of ANOK is crafted with responsibly sourced ingredients, ensuring a lasting impact on you—not on the environment.",
        cta: { label: "Learn More", href: "#about" },
    },

    newsletter: {
        headline: "Stay Connected with",
        brandHighlight: "ANOK",
        subtext:
            "Receive exclusive offers, early access to new fragrance launches, invitations to special events.",
        placeholder: "Enter your email",
        cta: "Subscribe Now",
    },

    footer: {
        tagline:
            "Refresh Your Senses With Exclusive Fragrances, Product Launches, And Special Offers Delivered To Your Inbox.",
        navColumns: [
            {
                heading: "Shop",
                links: [
                    { label: "Signature Collection", href: "#collection" },
                    { label: "Luxury Collection", href: "#collection" },
                    { label: "Limited Editions", href: "#collection" },
                    { label: "Seasonal Fragrances", href: "#collection" },
                ],
            },
            {
                heading: "Support",
                links: [
                    { label: "FAQs", href: "#" },
                    { label: "Shipping", href: "#" },
                    { label: "Returns", href: "#" },
                    { label: "Privacy Policy", href: "#" },
                    { label: "Terms of Use", href: "#" },
                ],
            },
            {
                heading: "Extras",
                links: [
                    { label: "Fragrance Guide", href: "#" },
                    { label: "Look Book", href: "#" },
                    { label: "Gift Sets", href: "#" },
                ],
            },
        ],
        credit: { label: "AbionSoft", href: "#" },
    },
};
