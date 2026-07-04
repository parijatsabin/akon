import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSiteData } from "../PublicSite";
import type { ProductItem } from "../admin/types/cms.types";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CATEGORIES = [
    { value: "all", label: "All Fragrances" },
    { value: "Signature Collection", label: "Signature Collection" },
    { value: "Luxury Collection", label: "Luxury Collection" },
    { value: "Limited Edition", label: "Limited Edition" },
    { value: "Seasonal Fragrances", label: "Seasonal Fragrances" },
];

const SORT_OPTIONS = [
    { value: "default", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A–Z" },
];

function parsePrice(p: string): number { return parseInt(p.replace(/[^0-9]/g, ""), 10) || 0; }

const StarIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ProductCard: React.FC<{ item: ProductItem }> = ({ item }) => (
    <Link to={`/products/${item.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div className="product-card">
            <div className="product-card-img">
                <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                        const t = e.currentTarget;
                        t.onerror = null;
                        t.src = "/logo.png";
                        t.style.objectFit = "contain";
                        t.style.padding = "28px";
                        t.style.opacity = "0.18";
                    }}
                />
                {item.badge && <span className="card-badge" style={{ position: "absolute", top: 10, left: 10 }}>{item.badge}</span>}
                <div className="product-card-quick">
                    View Details
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
            </div>
            <div className="product-card-body">
                <div className="product-card-collection">{item.collection}</div>
                <div className="product-card-name">{item.name}</div>
                <div style={{ display: "flex", gap: 2, marginTop: 3 }}>{[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}</div>
                <div className="product-card-price">{item.price}</div>
            </div>
        </div>
    </Link>
);

interface SidebarProps {
    categoryParam: string; search: string; sortBy: string;
    totalCount: number; filteredCount: number;
    onCategory: (c: string) => void; onSearch: (s: string) => void;
    onSort: (s: string) => void; onClear: () => void;
}

const SidebarContent: React.FC<SidebarProps> = ({ categoryParam, search, sortBy, onCategory, onSearch, onSort, onClear }) => {
    const hasFilters = categoryParam !== "all" || search.trim() !== "" || sortBy !== "default";
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Search */}
            <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Search</div>
                <div style={{ position: "relative" }}>
                    <svg style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input type="search" placeholder="Search fragrances…" value={search} onChange={(e) => onSearch(e.target.value)}
                        className="contact-input" style={{ paddingLeft: 34 }} />
                </div>
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Collection</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {CATEGORIES.map((cat) => {
                        const active = categoryParam === cat.value;
                        return (
                            <button key={cat.value} onClick={() => onCategory(cat.value)}
                                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: `1.5px solid ${active ? "var(--charcoal)" : "var(--border)"}`, fontFamily: "var(--font-body)", fontSize: "0.88rem", fontWeight: active ? 700 : 500, cursor: "pointer", transition: "all 0.18s", textAlign: "left", background: active ? "var(--charcoal)" : "transparent", color: active ? "#fff" : "var(--text-muted)" }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? "var(--gold-light)" : "var(--border)", flexShrink: 0 }} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sort */}
            <div style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Sort By</div>
                <select value={sortBy} onChange={(e) => onSort(e.target.value)} className="contact-input" style={{ cursor: "pointer" }}>
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>

            {/* Count + clear */}
            {hasFilters && (<div style={{ padding: "13px 16px", background: "var(--parchment)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>


                <button onClick={onClear} style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--gold)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5 }}>
                    ✕ Clear all filters
                </button>

            </div>
            )}
        </div>
    );
};

const ProductsPage: React.FC = () => {
    const { collection: COLLECTION } = useSiteData();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState("default");
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef<HTMLDivElement>(null);
    const categoryParam = searchParams.get("category") || "all";

    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
    useEffect(() => {
        if (!drawerOpen) return;
        const h = (e: MouseEvent) => { if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setDrawerOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [drawerOpen]);
    useEffect(() => { document.body.style.overflow = drawerOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [drawerOpen]);

    let filtered = COLLECTION.items.filter((item) => {
        const matchCat = categoryParam === "all" || item.collection === categoryParam;
        const q = search.toLowerCase();
        const matchSearch = !q || item.name.toLowerCase().includes(q) || item.collection.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        return matchCat && matchSearch;
    });
    if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    if (sortBy === "name-asc") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    const setCategory = (cat: string) => {
        if (cat === "all") searchParams.delete("category"); else searchParams.set("category", cat);
        setSearchParams(searchParams); setDrawerOpen(false);
    };
    const handleClear = () => { setSearch(""); setCategory("all"); setSortBy("default"); };
    const hasFilters = categoryParam !== "all" || search.trim() !== "" || sortBy !== "default";

    const sidebarProps: SidebarProps = { categoryParam, search, sortBy, totalCount: COLLECTION.items.length, filteredCount: filtered.length, onCategory: setCategory, onSearch: setSearch, onSort: setSortBy, onClear: handleClear };

    return (
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
            <Navbar />

            {/* Mobile filter bar */}
            <div className="mobile-filter-bar">
                <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <button onClick={() => setDrawerOpen(true)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-body)", fontSize: "0.80rem", fontWeight: 600, background: hasFilters ? "var(--charcoal)" : "var(--warm-white)", color: hasFilters ? "#fff" : "var(--text-main)", cursor: "pointer", transition: "all 0.18s" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
                        Filters{hasFilters ? " · Active" : ""}
                    </button>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}><strong style={{ color: "var(--text-main)" }}>{filtered.length}</strong> of {COLLECTION.items.length}</p>
                </div>
            </div>

            {/* Layout */}
            <div className="container" style={{ paddingTop: 120, paddingBottom: 80 }}>
                {/* Inline page heading + search */}

                {/* Inline heading */}
                <div style={{ marginTop: 20, marginBottom: 20, paddingBottom: 28, textAlign: "center" }}>
                    <span className="tag" style={{ fontSize: "0.92rem" }} >Our Collection</span>
                    <p style={{ fontSize: "0.92rem", color: "var(--text-muted)" }}>
                        Rare, slow-crafted fragrances — each holding time, memory and the quiet weight of luxury.
                    </p>
                </div>

                <div className="collection-layout">
                    <aside className="collection-sidebar"><SidebarContent {...sidebarProps} /></aside>
                    <div>
                        {/* Active filter chips */}
                        {hasFilters && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                                {categoryParam !== "all" && (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "var(--charcoal)", color: "#fff", borderRadius: 30, fontSize: "0.72rem", fontWeight: 600 }}>
                                        {categoryParam}
                                        <button onClick={() => setCategory("all")} style={{ background: "none", border: "none", color: "var(--gold-light)", cursor: "pointer", padding: 0, fontSize: "0.78rem" }}>✕</button>
                                    </span>
                                )}
                                {search.trim() !== "" && (
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "var(--charcoal)", color: "#fff", borderRadius: 30, fontSize: "0.72rem", fontWeight: 600 }}>
                                        "{search}"
                                        <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "var(--gold-light)", cursor: "pointer", padding: 0, fontSize: "0.78rem" }}>✕</button>
                                    </span>
                                )}
                            </div>
                        )}

                        {filtered.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "80px 0" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✦</div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--text-main)", marginBottom: 8 }}>No fragrances found</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 20 }}>Try adjusting your filters or search terms.</p>
                                <button onClick={handleClear} className="btn btn-outline" style={{ fontSize: "0.80rem" }}>Clear Filters</button>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {filtered.map((item) => <ProductCard key={item.id} item={item} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(13,12,11,0.55)", backdropFilter: "blur(3px)" }}>
                    <div ref={drawerRef} style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: "min(320px,88vw)", background: "var(--warm-white)", boxShadow: "4px 0 32px rgba(0,0,0,0.18)", overflowY: "auto", padding: "24px 20px 40px", animation: "slideInLeft 0.28s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-main)" }}>Filters</span>
                            <button onClick={() => setDrawerOpen(false)} style={{ width: 34, height: 34, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)" }}>✕</button>
                        </div>
                        <SidebarContent {...sidebarProps} onCategory={(cat) => { setCategory(cat); setDrawerOpen(false); }} />
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProductsPage;
