/**
 * PublicSite — wraps all public-facing components.
 *
 * Data priority:
 *   1. Worker API (/api/cms)  — live, persistent, multi-device
 *   2. localStorage (cmsStore) — instant render + offline fallback
 *
 * The SiteDataContext shape is unchanged so all child components
 * continue to work without modification.
 */
import React from "react";
import { useSiteContent } from "./api/hooks/useSiteContent.ts";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import About from "./components/About";
import Collection from "./components/Collection";
import Testimonials from "./components/Testimonials";
import Commitment from "./components/Commitment";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import type { SiteData } from "./admin/types/cms.types";

export const SiteDataContext = React.createContext<SiteData | null>(null);

export function useSiteData(): SiteData {
    const ctx = React.useContext(SiteDataContext);
    if (!ctx) throw new Error("useSiteData used outside PublicSite");
    return ctx;
}

const PublicSite: React.FC = () => {
    const { data } = useSiteContent();

    return (
        <SiteDataContext.Provider value={data}>
            <Navbar />
            <Hero />
            <StatsBar />
            <About />
            <Collection />
            <Testimonials />
            <Commitment />
            <Newsletter />
            <Footer />
        </SiteDataContext.Provider>
    );
};

export default PublicSite;
