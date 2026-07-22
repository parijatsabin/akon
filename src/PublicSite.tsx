/**
 * PublicSite — homepage (SPA sections).
 *
 * SiteDataContext is provided by App.tsx → PublicDataProvider.
 * Every component in the tree calls useSiteData() to read CMS data.
 * Live updates come automatically via the cms:update event in useCmsData.
 */
import React, { useEffect } from "react";
import type { SiteData } from "./admin/types/cms.types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SignatureProduct from "./components/SignatureProduct";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

// ── Shared context ────────────────────────────────────────────
// Exported so App.tsx can reference it in PublicDataProvider
// and so every page component can import useSiteData.
export const SiteDataContext = React.createContext<SiteData | null>(null);

export function useSiteData(): SiteData {
    const ctx = React.useContext(SiteDataContext);
    if (!ctx) throw new Error("useSiteData must be used inside PublicDataProvider (see App.tsx)");
    return ctx;
}

// ── SEO head manager ─────────────────────────────────────────
// Writes meta tags directly to <head>. No extra dependency needed.
// Updates live whenever CMS data changes.
function useSeoHead(seo: SiteData["seo"], brandName: string): void {
    useEffect(() => {
        const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
            let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute(attr, name);
                document.head.appendChild(el);
            }
            el.setAttribute("content", content);
        };

        if (seo.metaTitle) document.title = seo.metaTitle;
        if (seo.metaDescription) setMeta("description", seo.metaDescription);
        if (seo.keywords) setMeta("keywords", seo.keywords);

        // Open Graph
        if (seo.ogTitle) setMeta("og:title", seo.ogTitle, "property");
        if (seo.ogDescription) setMeta("og:description", seo.ogDescription, "property");
        if (seo.ogImage) setMeta("og:image", seo.ogImage, "property");
        setMeta("og:type", "website", "property");
        setMeta("og:site_name", brandName, "property");
    }, [seo, brandName]);
}

// ── SEO wrapper for homepage ──────────────────────────────────
const HomeSeo: React.FC = () => {
    const { seo, brand } = useSiteData();
    useSeoHead(seo, brand.name);
    return null;
};

// ── Homepage ──────────────────────────────────────────────────
const PublicSite: React.FC = () => (
    <>
        <HomeSeo />
        <Navbar />
        <Hero />
        {/* <StatsBar /> */}
        <SignatureProduct />
        {/* <About /> */}
        {/* <Collection /> */}
        {/* <CollectionTiles /> */}
        <Commitment />
        {/* <Testimonials /> */}
        <Newsletter />
        <Footer />
    </>
);

export default PublicSite;
