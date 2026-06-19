import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { BRAND, NAV_LINKS } from "../data/siteContent";

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
            background: scrolled ? "rgba(255,249,243,0.95)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid var(--border)" : "none",
            transition: "all 0.3s ease",
        }}>
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
                {/* Logo */}
                <a href="#home" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img 
                        src={`${import.meta.env.BASE_URL}logo.png`} 
                        alt={BRAND.name} 
                        style={{ 
                            height: 44, 
                            width: "auto" 
                        }} 
                    />
                </a>

                {/* Desktop nav */}
                <nav style={{ display: "flex", gap: 40 }} className="desktop-nav">
                    {NAV_LINKS.map((link) => {
                        const baseColor = scrolled ? "var(--text-main)" : "#fff";
                        return (
                            <a key={link.label} href={link.href} style={{
                                fontSize: "1rem", fontWeight: 500,
                                color: baseColor, letterSpacing: "0.02em",
                                position: "relative", paddingBottom: 2,
                                transition: "color 0.2s",
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                                onMouseLeave={e => (e.currentTarget.style.color = baseColor)}
                            >
                                {link.label}
                            </a>
                        );
                    })}
                </nav>

                {/* Icons */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <button aria-label="Search" style={{ color: scrolled ? "var(--text-main)" : "#fff", display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 500 }}>
                        <Search size={20} /> Search
                    </button>
                    <button aria-label="Cart" style={{ color: scrolled ? "var(--text-main)" : "#fff", position: "relative" }}>
                        <ShoppingCart size={24} />
                        <span style={{
                            position: "absolute", top: -8, right: -8,
                            width: 20, height: 20, borderRadius: "50%",
                            background: "var(--gold)", color: "#fff",
                            fontSize: "0.7rem", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>3</span>
                    </button>
                    <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}
                        style={{ display: "none", color: scrolled ? "var(--text-main)" : "#fff" }} aria-label="Menu">
                        {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div style={{
                    background: "var(--warm-white)", borderTop: "1px solid var(--border)",
                    padding: "24px 32px 32px",
                }}>
                    {NAV_LINKS.map(link => (
                        <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)}
                            style={{ display: "block", padding: "14px 0", fontWeight: 500, borderBottom: "1px solid var(--border)", fontSize: "1.05rem" }}>
                            {link.label}
                        </a>
                    ))}
                </div>
            )}

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