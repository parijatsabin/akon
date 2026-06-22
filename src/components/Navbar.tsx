import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "../data/siteContent";

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const linkColor = scrolled ? "var(--charcoal)" : "#fff";

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? "rgba(255,249,243,0.97)" : "transparent",
            backdropFilter: scrolled ? "blur(14px)" : "none",
            borderBottom: scrolled ? "1px solid var(--border)" : "none",
            transition: "all 0.35s ease",
        }}>
            <div className="container" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 100,
            }}>

                {/* ── Logo ── */}
                <a href="#home" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img
                        src={`${import.meta.env.BASE_URL}logo.png`}
                        alt={BRAND.name}
                        style={{
                            height: 110,
                            width: "auto",
                            filter: scrolled
                                ? "none"
                                : "brightness(0) invert(1) drop-shadow(0 0 8px rgba(201,153,44,0.5))",
                            transition: "filter 0.35s ease",
                        }}
                    />
                </a>

                {/* ── Desktop nav ── */}
                <nav className="desktop-nav" style={{
                    display: "flex",
                    gap: 8,
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                }}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            style={{
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                color: linkColor,
                                letterSpacing: "0.04em",
                                padding: "8px 18px",
                                borderRadius: 6,
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.color = "var(--gold)";
                                e.currentTarget.style.background = scrolled
                                    ? "rgba(201,153,44,0.08)"
                                    : "rgba(255,255,255,0.1)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.color = linkColor;
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* ── Right side: CTA + mobile toggle ── */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

                    {/* Desktop CTA button */}
                    <a
                        href="#collection"
                        className="desktop-nav"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 22px",
                            borderRadius: 6,
                            fontSize: "0.88rem",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            background: scrolled ? "var(--gold)" : "rgba(201,153,44,0.85)",
                            color: "#fff",
                            border: "none",
                            transition: "all 0.25s",
                            whiteSpace: "nowrap",
                            backdropFilter: "blur(4px)",
                            textDecoration: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--gold-dark)")}
                        onMouseLeave={e => (e.currentTarget.style.background = scrolled ? "var(--gold)" : "rgba(201,153,44,0.85)")}
                    >
                        Shop Now
                    </a>

                    {/* Mobile hamburger */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                        style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40, height: 40,
                            borderRadius: 8,
                            background: scrolled ? "var(--section-bg)" : "rgba(255,255,255,0.15)",
                            border: scrolled ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.25)",
                            color: linkColor,
                            transition: "all 0.2s",
                            cursor: "pointer",
                        }}
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <div style={{
                maxHeight: mobileOpen ? 400 : 0,
                overflow: "hidden",
                transition: "max-height 0.35s ease",
                background: "var(--warm-white)",
                borderTop: mobileOpen ? "1px solid var(--border)" : "none",
            }}>
                <div style={{ padding: "12px 24px 28px" }}>
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "14px 4px",
                                fontWeight: 600,
                                fontSize: "1rem",
                                color: "var(--charcoal)",
                                borderBottom: "1px solid var(--border)",
                                transition: "color 0.2s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--charcoal)")}
                        >
                            {link.label}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}
                    <a href="#collection" onClick={() => setMobileOpen(false)}
                        style={{ display: "block", marginTop: 20, padding: "13px 0", background: "var(--gold)", color: "#fff", textAlign: "center", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.06em" }}>
                        Shop Now
                    </a>
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
