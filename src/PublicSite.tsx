/**
 * PublicSite — homepage (SPA sections).
 *
 * Site data is provided by <SiteDataProvider> in App.tsx; every component
 * in the tree reads it via useSiteData(). Live updates arrive automatically
 * through the "cms:update" event handled by the provider.
 *
 * PageShell supplies the navbar, footer and scroll handling — the homepage was
 * the one page still assembling those itself, which meant arriving at
 * /#signature from another route did not scroll to the product.
 */
import React from "react";
import { useSiteData } from "./data/SiteDataProvider";
import { useSeoHead } from "./hooks/useSeoHead";
import PageShell from "./components/PageShell";
import Hero from "./components/Hero";
import SignatureProduct from "./components/SignatureProduct";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";

// ── SEO wrapper for homepage ──────────────────────────────────
const HomeSeo: React.FC = () => {
    const { seo, brand } = useSiteData();
    useSeoHead(seo, brand.name);
    return null;
};

// ── Homepage ──────────────────────────────────────────────────
const PublicSite: React.FC = () => (
    <PageShell>
        <HomeSeo />
        <Hero />
        <SignatureProduct />
        <Commitment />
        <Newsletter />
    </PageShell>
);

export default PublicSite;
