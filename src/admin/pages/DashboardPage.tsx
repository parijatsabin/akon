import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../../data/SiteDataProvider";
import { Stat } from "../components/ui/Section";
import { ArrowRight } from "lucide-react";

const SECTIONS = [
    { label: "Settings", href: "/admin/settings", note: "Brand, hero, about, navigation, footer" },
    { label: "Signature Product", href: "/admin/featured", note: "Notes, pricing, sizes, imagery" },
    { label: "Testimonials", href: "/admin/testimonials", note: "Customer reviews" },
    { label: "SEO", href: "/admin/seo", note: "Meta tags and social sharing" },
];

const DashboardPage: React.FC = () => {
    const data = useSiteData();

    return (
        <div>
            <header className="adm-page-head">
                <h1 className="adm-page-title">Dashboard</h1>
                <p className="adm-page-sub">{data.brand.name} content studio</p>
            </header>

            <div className="adm-stat-row">
                <Stat label="Product sizes" value={data.featuredProduct.sizes.length} />
                <Stat label="Testimonials" value={data.testimonials.items.length} />
                <Stat label="Nav links" value={data.navLinks.filter((l) => l.enabled !== false).length} />
                <Stat label="Sections" value={SECTIONS.length} />
            </div>

            <div className="adm-featured">
                <div className="adm-featured-label">Currently featured</div>
                <div className="adm-featured-name">{data.featuredProduct.name}</div>
                <div className="adm-featured-meta">
                    {data.featuredProduct.collection} · {data.featuredProduct.price}
                </div>
            </div>

            <nav className="adm-list" aria-label="Content sections">
                {SECTIONS.map((s) => (
                    <Link key={s.href} to={s.href} className="adm-list-row">
                        <span className="adm-list-label">{s.label}</span>
                        <span className="adm-list-note">{s.note}</span>
                        <ArrowRight size={15} className="adm-list-arrow" />
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default DashboardPage;
