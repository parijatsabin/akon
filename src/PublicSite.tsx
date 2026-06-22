/**
 * PublicSite — wraps all public-facing components.
 * Uses useCmsData() so any admin save is reflected live.
 */
import React from "react";
import { useCmsData } from "./admin/cms/useCmsData";
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

// Provide data as a React context so every component can read it
// without prop drilling
export const SiteDataContext = React.createContext<SiteData | null>(null);

export function useSiteData(): SiteData {
    const ctx = React.useContext(SiteDataContext);
    if (!ctx) throw new Error("useSiteData used outside PublicSite");
    return ctx;
}

const PublicSite: React.FC = () => {
    const data = useCmsData();

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
