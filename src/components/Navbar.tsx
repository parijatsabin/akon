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
                <a
                    href="#home"
                    style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
                >
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
                </a>

                {/* ── Desktop nav ── */}
                <nav
                    className="desktop-nav"
                    style={{
                        display: "flex",
                        gap: 4,
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                    }}
                >
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
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
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* ── Right: CTA + mobile toggle ── */}
                <div
                    style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}
                >
                    {/* Desktop CTA */}
                    <a
                        href="#collection"
                        className="desktop-nav"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 26px",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            background: scrolled ? "var(--gold)" : "rgba(162,127,63,0.85)",
                            color: "#fff",
                            border: "none",
                            transition: "all 0.26s",
                            whiteSpace: "nowrap",
                            backdropFilter: "blur(4px)",
                            textDecoration: "none",
                            boxShadow: scrolled ? "0 4px 16px rgba(162,127,63,0.28)" : "none",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--gold-dim)";
                            e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = scrolled
                                ? "var(--gold)"
                                : "rgba(162,127,63,0.85)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
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
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            style={{
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
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "var(--text-main)")
                            }
                        >
                            {link.label}
                            <svg
                                width="16" height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}
                    <a
                        href="#collection"
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
                        }}
                    >
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
