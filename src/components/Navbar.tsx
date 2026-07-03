import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteData } from "../PublicSite";

/** Render a nav link as <Link> for real routes (/products)
 *  or a plain <a> for hash anchors (#home, #reviews). */
const NavItem: React.FC<{
    href: string;
    label: string;
    style: React.CSSProperties;
    onMouseEnter: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    onMouseLeave: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    onClick?: () => void;
}> = ({ href, label, style, onMouseEnter, onMouseLeave, onClick }) => {
    const isRoute = href.startsWith("/");
    if (isRoute) {
        return (
            <Link to={href} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
                {label}
            </Link>
        );
    }
    return (
        <a href={href} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onClick}>
            {label}
        </a>
    );
};

const Navbar: React.FC = () => {
    const { brand: BRAND, navLinks: NAV_LINKS } = useSiteData();
    const location = useLocation();
    const isHome = location.pathname === "/";
    const [scrolled, setScrolled] = useState(!isHome);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (!isHome) {
            setScrolled(true);
            return;
        }
        const onScroll = () => setScrolled(window.scrollY > 40);
        setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [isHome]);

    const linkColor = scrolled ? "var(--text-main)" : "#fff";

    return (
        <header
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0,
                zIndex: 100,
                background: scrolled ? "rgba(253, 250, 245, 0.96)" : "transparent",
                backdropFilter: scrolled ? "blur(18px)" : "none",
                borderBottom: scrolled ? "1px solid var(--border)" : "none",
                transition: "all 0.38s ease",
            }}
        >
            <div
                className="container"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 96,
                }}
            >
                {/* ── Logo ── */}
                <Link to="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt={BRAND.name}
                        style={{
                            height: 108,
                            width: "auto",
                            filter: scrolled
                                ? "none"
                                : "brightness(0) invert(1) drop-shadow(0 0 10px rgba(162,127,63,0.55))",
                            transition: "filter 0.38s ease",
                        }}
                    />
                </Link>

                {/* ── Desktop nav ── */}
                <nav
                    className="desktop-nav"
                    style={{
                        display: "flex",
                        gap: 4,
                        marginLeft: "auto",
                        marginRight: 0,
                    }}
                >
                    {NAV_LINKS.map((link) => (
                        <NavItem
                            key={link.label}
                            href={link.href}
                            label={link.label}
                            style={{
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                color: linkColor,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "8px 20px",
                                borderRadius: "var(--radius-sm)",
                                transition: "all 0.22s",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = "var(--gold-light)";
                                e.currentTarget.style.background = scrolled
                                    ? "var(--gold-glow)"
                                    : "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = linkColor;
                                e.currentTarget.style.background = "transparent";
                            }}
                        />
                    ))}
                </nav>

                {/* ── Mobile toggle only ── */}
                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 42, height: 42,
                            borderRadius: "var(--radius-sm)",
                            background: scrolled ? "var(--parchment)" : "rgba(255,255,255,0.12)",
                            border: scrolled
                                ? "1px solid var(--border)"
                                : "1px solid rgba(255,255,255,0.25)",
                            color: linkColor,
                            transition: "all 0.22s",
                            cursor: "pointer",
                        }}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <div
                style={{
                    maxHeight: mobileOpen ? 440 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.38s ease",
                    background: "var(--warm-white)",
                    borderTop: mobileOpen ? "1px solid var(--border)" : "none",
                }}
            >
                <div style={{ padding: "12px 24px 32px" }}>
                    {NAV_LINKS.map((link) => {
                        const isRoute = link.href.startsWith("/");
                        const sharedStyle: React.CSSProperties = {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "15px 4px",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            color: "var(--text-main)",
                            borderBottom: "1px solid var(--border)",
                            transition: "color 0.2s",
                        };
                        const arrow = (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        );
                        if (isRoute) {
                            return (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    style={sharedStyle}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                                >
                                    {link.label}{arrow}
                                </Link>
                            );
                        }
                        return (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                style={sharedStyle}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-main)")}
                            >
                                {link.label}{arrow}
                            </a>
                        );
                    })}
                    <Link
                        to="/products"
                        onClick={() => setMobileOpen(false)}
                        style={{
                            display: "block",
                            marginTop: 22,
                            padding: "14px 0",
                            background: "var(--gold)",
                            color: "#fff",
                            textAlign: "center",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                        }}
                    >
                        Shop Now
                    </Link>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
        </header>
    );
};

export default Navbar;
