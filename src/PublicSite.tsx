/**
 * PublicSite — homepage (SPA sections).
 *
 * SiteDataContext is provided by App.tsx → PublicDataProvider.
 * Every component in the tree calls useSiteData() to read CMS data.
 * Live updates come automatically via the cms:update event in useCmsData.
 */
import React from "react";
import type { SiteData } from "./admin/types/cms.types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import SignatureProduct from "./components/SignatureProduct";
import Testimonials from "./components/Testimonials";
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

// ── Homepage ──────────────────────────────────────────────────
const PublicSite: React.FC = () => (
    <>
        <Navbar />
        <Hero />
        <StatsBar />
        <About />
        <SignatureProduct />
        <Testimonials />
        <Commitment />
        <Newsletter />
        <Footer />
    </>
);

export default PublicSite;
