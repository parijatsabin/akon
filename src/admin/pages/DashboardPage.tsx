import React from "react";
import { Link } from "react-router-dom";
import { readStore } from "../cms/cmsStore";
import { StatCard } from "../components/ui/Card";
import {
    ShoppingBag, MessageSquare, Settings, ArrowRight,
    LayoutDashboard, Globe, Star,
} from "lucide-react";

const SECTIONS = [
    {
        label: "Global Settings",
        href: "/admin/settings",
        icon: <Settings size={22} />,
        desc: "Hero, About, Navigation, Footer, Newsletter, Stats, Brand info and more — all in one tabbed view.",
        tags: ["Brand", "Hero", "Stats", "About", "Navigation", "Newsletter", "Footer", "Commitment"],
    },
    {
        label: "Collection",
        href: "/admin/collection",
        icon: <ShoppingBag size={22} />,
        desc: "Add, edit, reorder and remove products. Manage fragrance notes, pricing, badges and images.",
        tags: ["Products", "Pricing", "Images", "Badges"],
    },
    {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: <MessageSquare size={22} />,
        desc: "Manage customer reviews. Add new quotes, update star ratings and author details.",
        tags: ["Reviews", "Ratings", "Quotes"],
    },
];

const DashboardPage: React.FC = () => {
    const data = readStore();
    const productCount = data.collection.items.length;
    const reviewCount = data.testimonials.items.length;
    const navCount = data.navLinks.length;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                        <LayoutDashboard size={20} />
                    </div>
                    <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                        Dashboard
                    </h1>
                </div>
                <p style={{ fontSize: "0.90rem", color: "var(--text-muted)", marginLeft: 52 }}>
                    Welcome back, <strong>{data.brand.name}</strong> Content Studio.
                </p>
            </div>

            {/* Stat cards */}
            <div className="dash-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 44 }}>
                <StatCard label="Products" value={productCount} icon={<ShoppingBag size={20} />} />
                <StatCard label="Testimonials" value={reviewCount} icon={<Star size={20} />} />
                <StatCard label="Nav Links" value={navCount} icon={<Globe size={20} />} />
                <StatCard label="Sections" value={8} icon={<Settings size={20} />} />
            </div>

            {/* Section cards */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 18 }}>
                Manage Content
            </h2>
            <div className="dash-section-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
                {SECTIONS.map((s) => (
                    <Link key={s.href} to={s.href} style={{ textDecoration: "none" }}>
                        <div
                            style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column", gap: 14, transition: "all 0.22s", boxShadow: "var(--shadow)", cursor: "pointer" }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--gold-subtle)"; el.style.boxShadow = "var(--shadow-gold)"; el.style.transform = "translateY(-3px)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "var(--shadow)"; el.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: "var(--parchment)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
                                    {s.icon}
                                </div>
                                <ArrowRight size={15} style={{ color: "var(--text-faint)", marginTop: 4 }} />
                            </div>
                            <div>
                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text-main)", marginBottom: 8 }}>{s.label}</div>
                                <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>{s.desc}</p>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                    {s.tags.map((t) => (
                                        <span key={t} style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 20, background: "var(--parchment)", color: "var(--gold)", border: "1px solid var(--border)" }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Brand snapshot */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 16 }}>
                Brand Snapshot
            </h2>
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {[
                        { label: "Brand Name", value: data.brand.name },
                        { label: "Email", value: data.brand.email },
                        { label: "Location", value: data.brand.location },
                        { label: "Phone", value: data.brand.phoneDisplay },
                        { label: "Hero Heading", value: data.hero.mainHeading.replace("\n", " ") },
                        { label: "CTA Primary", value: data.hero.ctaPrimary.label },
                    ].map((row) => (
                        <div key={row.label} style={{ padding: "12px 14px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{row.label}</div>
                            <div style={{ fontSize: "0.86rem", color: "var(--text-main)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @media (max-width: 900px)  { .dash-section-grid { grid-template-columns: 1fr 1fr !important; } .dash-stat-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px)  { .dash-section-grid { grid-template-columns: 1fr !important; } .dash-stat-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
        </div>
    );
};

export default DashboardPage;
