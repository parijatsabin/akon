import React from "react";
import { Link } from "react-router-dom";
import { readStore } from "../cms/cmsStore";
import { StatCard } from "../components/ui/Card";
import {
    ShoppingBag, MessageSquare, PanelBottom,
    Settings, Image, BarChart2, Info, Anchor,
    Mail, Menu, ArrowRight,
} from "lucide-react";

const QUICK_LINKS = [
    { label: "Hero Section", href: "/admin/hero", icon: <Image size={18} />, desc: "Edit heading, CTA buttons" },
    { label: "Collection", href: "/admin/collection", icon: <ShoppingBag size={18} />, desc: "Add, edit, remove products" },
    { label: "Testimonials", href: "/admin/testimonials", icon: <MessageSquare size={18} />, desc: "Manage customer reviews" },
    { label: "Global Settings", href: "/admin/settings", icon: <Settings size={18} />, desc: "Brand info, contact, hours" },
    { label: "Stats Bar", href: "/admin/stats", icon: <BarChart2 size={18} />, desc: "Update key metrics" },
    { label: "About", href: "/admin/about", icon: <Info size={18} />, desc: "Story, reasons, cards" },
    { label: "Commitment", href: "/admin/commitment", icon: <Anchor size={18} />, desc: "Purity pledge content" },
    { label: "Newsletter", href: "/admin/newsletter", icon: <Mail size={18} />, desc: "CTA text and copy" },
    { label: "Navigation", href: "/admin/navigation", icon: <Menu size={18} />, desc: "Menu links and order" },
    { label: "Footer", href: "/admin/footer", icon: <PanelBottom size={18} />, desc: "Tagline, columns, credit" },
];

const DashboardPage: React.FC = () => {
    const data = readStore();
    const productCount = data.collection.items.length;
    const reviewCount = data.testimonials.items.length;
    const navCount = data.navLinks.length;
    const footerCols = data.footer.navColumns.length;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: "0.90rem", color: "var(--text-muted)" }}>
                    Overview of your <strong>{data.brand.name}</strong> website content.
                </p>
            </div>

            {/* Stat cards */}
            <div className="dash-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 36 }}>
                <StatCard label="Products" value={productCount} icon={<ShoppingBag size={20} />} />
                <StatCard label="Testimonials" value={reviewCount} icon={<MessageSquare size={20} />} />
                <StatCard label="Nav Links" value={navCount} icon={<Menu size={20} />} />
                <StatCard label="Footer Cols" value={footerCols} icon={<PanelBottom size={20} />} />
            </div>

            {/* Quick access */}
            <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 18 }}>
                    Manage Content
                </h2>
                <div className="dash-link-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                    {QUICK_LINKS.map((item) => (
                        <Link key={item.href} to={item.href} style={{ textDecoration: "none" }}>
                            <div
                                style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10, transition: "all 0.22s", boxShadow: "var(--shadow)", cursor: "pointer", height: "100%" }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "var(--gold-subtle)";
                                    el.style.boxShadow = "var(--shadow-gold)";
                                    el.style.transform = "translateY(-3px)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLDivElement;
                                    el.style.borderColor = "var(--border)";
                                    el.style.boxShadow = "var(--shadow)";
                                    el.style.transform = "translateY(0)";
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ width: 38, height: 38, borderRadius: "var(--radius-sm)", background: "var(--parchment)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <ArrowRight size={14} style={{ color: "var(--text-faint)" }} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.92rem", color: "var(--text-main)", marginBottom: 3 }}>{item.label}</div>
                                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Brand snapshot */}
            <div style={{ marginTop: 32, background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px", boxShadow: "var(--shadow)" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, color: "var(--text-main)", marginBottom: 18 }}>
                    Brand Snapshot
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {[
                        { label: "Brand Name", value: data.brand.name },
                        { label: "Email", value: data.brand.email },
                        { label: "Location", value: data.brand.location },
                        { label: "Phone", value: data.brand.phoneDisplay },
                        { label: "Hero Heading", value: data.hero.mainHeading.replace("\n", " ") },
                        { label: "CTA Primary", value: data.hero.ctaPrimary.label },
                    ].map((row) => (
                        <div key={row.label} style={{ padding: "12px 16px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{row.label}</div>
                            <div style={{ fontSize: "0.88rem", color: "var(--text-main)", fontWeight: 500 }}>{row.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @media (max-width: 1100px) { .dash-link-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 800px)  { .dash-link-grid { grid-template-columns: repeat(2, 1fr) !important; } .dash-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 500px)  { .dash-link-grid { grid-template-columns: 1fr !important; } .dash-stat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
        </div>
    );
};

export default DashboardPage;
