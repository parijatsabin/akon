/**
 * PublicSite — homepage (SPA sections).
 *
 * Site data is provided by <SiteDataProvider> in App.tsx; every component
 * in the tree reads it via useSiteData(). Live updates arrive automatically
 * through the "cms:update" event handled by the provider.
 */
import React from "react";
import { useSiteData } from "./data/SiteDataProvider";
import { useSeoHead } from "./hooks/useSeoHead";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SignatureProduct from "./components/SignatureProduct";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

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
        <SignatureProduct />
        <Commitment />
        <Newsletter />
        <Footer />
    </>
);

export default PublicSite;
