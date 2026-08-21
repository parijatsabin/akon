/**
 * PageShell — the frame every public page sits in.
 *
 * AboutPage, ContactPage, FaqPage and PolicyPage each repeated the same
 * wrapper, the same Navbar and Footer, and their own copy of the scroll-reset
 * effect. Four copies of a frame is four places to fix when the frame changes.
 *
 * The scroll behaviour lives here because it is a property of navigating to a
 * page, not of any particular page's content.
 */

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageShellProps {
    children: React.ReactNode;
    /**
     * Re-runs the scroll handling when it changes. PolicyPage renders both
     * Privacy and Terms from one component, so moving between them is not a
     * remount and would otherwise keep the previous scroll position.
     */
    resetKey?: string;
}

const PageShell: React.FC<PageShellProps> = ({ children, resetKey }) => {
    const { hash } = useLocation();

    useEffect(() => {
        // A link with an anchor asked for a specific place on the page, and
        // scrolling to the top would silently ignore it — which is what the
        // footer's "Ingredients & Safety" link (/fragrance#composition) does.
        if (hash) {
            // The target renders in the same commit, so wait a frame for it.
            const id = hash.slice(1);
            const raf = requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            return () => cancelAnimationFrame(raf);
        }

        // React Router preserves scroll position between routes, so arriving
        // at a new page part-way down is otherwise the default.
        window.scrollTo({ top: 0 });
    }, [hash, resetKey]);

    return (
        <div className="page-shell">
            <Navbar />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default PageShell;
