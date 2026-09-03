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
import PageShell from "./components/PageShell";
import Hero from "./components/Hero";
import SignatureProduct from "./components/SignatureProduct";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";

// ── Homepage ──────────────────────────────────────────────────
const PublicSite: React.FC = () => (
    <PageShell>
        <Hero />
        <SignatureProduct />
        <Commitment />
        {/* No testimonials here by choice: they live on /about and /fragrance.
            The homepage's Product structured data drops its review markup to
            match — see seo/structuredData. */}
        <Newsletter />
    </PageShell>
);

export default PublicSite;
