import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteData } from "../data/SiteDataProvider";

const NavItem: React.FC<{ href: string; label: string; onClick?: () => void }> = ({ href, label, onClick }) => {
    const location = useLocation();
    const isInternal = href.startsWith("/");
    const isActive = isInternal
        ? (href === "/" ? location.pathname === "/" : location.pathname.startsWith(href))
        : false;

    const cls = `nav-link link-underline${isActive ? " is-active" : ""}`;
    return isInternal
        ? <Link to={href} className={cls} onClick={onClick}>{label}</Link>
        : <a href={href} className={cls} onClick={onClick}>{label}</a>;
};

const Navbar: React.FC = () => {
    const { brand: BRAND, navLinks: NAV_LINKS } = useSiteData();
    const location = useLocation();
    const isHome = location.pathname === "/";
    const [scrolled, setScrolled] = useState(!isHome);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Only show links that are enabled in the CMS
    const activeLinks = NAV_LINKS.filter((l) => l.enabled !== false);

    useEffect(() => {
        if (!isHome) { setScrolled(true); return; }
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    // Close the mobile menu on navigation
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    return (
        <header className={`navbar${scrolled ? " is-scrolled" : ""}`}>
            <div className="container navbar-inner">
                <Link to="/" className="navbar-logo" aria-label={BRAND.name}>
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt={BRAND.name} />
                </Link>

                <nav className="desktop-nav">
                    {activeLinks.map((link) => (
                        <NavItem key={link.label} href={link.href} label={link.label} />
                    ))}
                </nav>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`mobile-menu${mobileOpen ? " is-open" : ""}`}>
                <div className="mobile-menu-inner">
                    {activeLinks.map((link) => {
                        const arrow = (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        );
                        return link.href.startsWith("/")
                            ? <Link key={link.label} to={link.href} className="mobile-link">{link.label}{arrow}</Link>
                            : <a key={link.label} href={link.href} className="mobile-link" onClick={() => setMobileOpen(false)}>{link.label}{arrow}</a>;
                    })}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
