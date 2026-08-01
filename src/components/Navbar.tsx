import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteData } from "../PublicSite";

const NavItem: React.FC<{ href: string; label: string; scrolled: boolean; onClick?: () => void }> = ({ href, label, scrolled, onClick }) => {
    const location = useLocation();
    const isActive = href.startsWith("/")
        ? (href === "/" ? location.pathname === "/" : location.pathname.startsWith(href))
        : false;

    const cls = `nav-link ${scrolled ? "" : "nav-link-dark"}`;
    const style: React.CSSProperties = {
        color: isActive
            ? (scrolled ? "var(--gold)" : "var(--gold-light)")
            : (scrolled ? "var(--text-main)" : "#fff"),
        borderBottom: isActive ? "1.5px solid var(--gold)" : "1.5px solid transparent",
        paddingBottom: 6,
    };
    return href.startsWith("/")
        ? <Link to={href} className={cls} style={style} onClick={onClick}>{label}</Link>
        : <a href={href} className={cls} style={style} onClick={onClick}>{label}</a>;
};

const Navbar: React.FC = () => {
    const { brand: BRAND, navLinks: NAV_LINKS, mobileCtaLabel } = useSiteData();
    const location = useLocation();
    const isHome = location.pathname === "/";
    const [scrolled, setScrolled] = useState(!isHome);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Only show links that are enabled in the CMS
    const activeLinks = NAV_LINKS.filter((l) => l.enabled !== false);

    useEffect(() => {
        if (!isHome) { setScrolled(true); return; }
        const onScroll = () => setScrolled(window.scrollY > 40);
        setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? "rgba(245,242,237,0.97)" : "transparent",
            backdropFilter: scrolled ? "blur(18px)" : "none",
            borderBottom: scrolled ? "1px solid var(--border)" : "none",
            transition: "all 0.38s ease",
        }}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 96 }}>
                <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`} alt={BRAND.name}
                        style={{
                            height: 108, width: "auto", transition: "filter 0.38s ease",
                            filter: scrolled ? "none" : "brightness(0) invert(1) drop-shadow(0 0 10px rgba(162,127,63,0.55))"
                        }}
                    />
                </Link>

                <nav className="desktop-nav" style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
                    {activeLinks.map((link) => <NavItem key={link.label} href={link.href} label={link.label} scrolled={scrolled} />)}
                </nav>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu"
                    style={{
                        display: "none", alignItems: "center", justifyContent: "center",
                        width: 42, height: 42, borderRadius: "var(--radius-sm)",
                        background: scrolled ? "var(--parchment)" : "rgba(255,255,255,0.12)",
                        border: scrolled ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.25)",
                        color: scrolled ? "var(--text-main)" : "#fff", transition: "all 0.22s", cursor: "pointer",
                    }}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            <div style={{
                maxHeight: mobileOpen ? 440 : 0, overflow: "hidden",
                transition: "max-height 0.38s ease",
                background: "var(--warm-white)",
                borderTop: mobileOpen ? "1px solid var(--border)" : "none",
            }}>
                <div style={{ padding: "12px 24px 32px" }}>
                    {activeLinks.map((link) => {
                        const s: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 4px", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-main)", borderBottom: "1px solid var(--border)", transition: "color 0.2s" };
                        const arrow = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
                        return link.href.startsWith("/")
                            ? <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)} style={s}>{link.label}{arrow}</Link>
                            : <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} style={s}>{link.label}{arrow}</a>;
                    })}
                    <Link to="/products" onClick={() => setMobileOpen(false)} style={{ display: "block", marginTop: 22, padding: "14px 0", background: "var(--gold)", color: "#fff", textAlign: "center", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.88rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {mobileCtaLabel}
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
