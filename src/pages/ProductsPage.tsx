import React, { useState, useEffect } from "react";
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

function parsePrice(price: string): number {
    return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
}

const StarIcon: React.FC<{ filled?: boolean }> = ({ filled = true }) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "var(--gold)" : "var(--border)"} stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ProductCard: React.FC<{ item: ProductItem }> = ({ item }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            to={`/products/${item.id}`}
            style={{ textDecoration: "none", display: "block" }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    background: "#fff",
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    transition: "box-shadow 0.28s, transform 0.28s",
                    boxShadow: hovered ? "var(--shadow-gold)" : "var(--shadow)",
                    transform: hovered ? "translateY(-6px)" : "translateY(0)",
                    height: "100%",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Image */}
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "3/4",
                        background: "var(--parchment)",
                        overflow: "hidden",
                    }}
                >
                    <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition: "transform 0.55s ease",
                            transform: hovered ? "scale(1.07)" : "scale(1)",
                        }}
                    />

                    {/* Dark overlay on hover */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: hovered ? "rgba(13,12,11,0.25)" : "rgba(13,12,11,0)",
                            transition: "background 0.35s ease",
                        }}
                    />

                    {item.badge && (
                        <div
                            style={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                background: "var(--charcoal)",
                                color: "var(--gold-light)",
                                fontSize: "0.62rem",
                                fontWeight: 700,
                                letterSpacing: "0.10em",
                                textTransform: "uppercase",
                                padding: "5px 12px",
                                borderRadius: 3,
                            }}
                        >
                            {item.badge}
                        </div>
                    )}

                    {/* Quick view on hover */}
                    <div
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: "14px 16px",
                            background: "rgba(253,250,245,0.95)",
                            backdropFilter: "blur(8px)",
                            transform: hovered ? "translateY(0)" : "translateY(100%)",
                            transition: "transform 0.32s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "var(--gold-dim)",
                        }}
                    >
                        View Details
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Body */}
                <div
                    style={{
                        padding: "18px 20px 22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--gold)",
                        }}
                    >
                        {item.collection}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.05rem",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            lineHeight: 1.25,
                        }}
                    >
                        {item.name}
                    </div>
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled />)}
                    </div>
                    <p
                        style={{
                            fontSize: "0.80rem",
                            color: "var(--text-muted)",
                            lineHeight: 1.6,
                            marginTop: 4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {item.description}
                    </p>
                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "var(--gold-dim)",
                            marginTop: 8,
                        }}
                    >
                        {item.price}
                    </div>
                </div>
            </div>
        </Link>
    );
};

const ProductsPage: React.FC = () => {
    const { collection: COLLECTION, featuredProduct } = useSiteData();
    const [searchParams, setSearchParams] = useSearchParams();
    const [sortBy, setSortBy] = useState("default");
    const [search, setSearch] = useState("");

    const categoryParam = searchParams.get("category") || "all";

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Filter
    let filtered = COLLECTION.items.filter((item) => {
        const matchCat = categoryParam === "all" || item.collection === categoryParam;
        const matchSearch =
            search.trim() === "" ||
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.collection.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    // Sort
    if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    else if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    else if (sortBy === "name-asc") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    const setCategory = (cat: string) => {
        if (cat === "all") {
            searchParams.delete("category");
        } else {
            searchParams.set("category", cat);
        }
        setSearchParams(searchParams);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
            <Navbar />

            {/* ── Featured product spotlight ── */}
            <div style={{ background: "var(--parchment)", borderBottom: "1px solid var(--border)", padding: "24px 0", marginTop: 96 }}>
                <div className="container">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <img
                                src={featuredProduct.imageUrl}
                                alt={featuredProduct.name}
                                style={{ width: 52, height: 64, objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}
                            />
                            <div>
                                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 2 }}>
                                    ✦ Signature Piece
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--text-main)" }}>
                                    {featuredProduct.name}
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                    {featuredProduct.price} · {featuredProduct.collection}
                                </div>
                            </div>
                        </div>
                        <Link
                            to={`/products/${featuredProduct.id}`}
                            className="btn btn-gold"
                            style={{ fontSize: "0.78rem", padding: "10px 22px" }}
                        >
                            View Flagship
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Filters & Search bar ── */}
            <div style={{ background: "#fff", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 50 }}>
                <div className="container">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 16,
                            padding: "14px 0",
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Category pills */}
                        <div
                            className="cat-scroll"
                            style={{
                                display: "flex",
                                gap: 8,
                                overflowX: "auto",
                                paddingBottom: 2,
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            {CATEGORIES.map((cat) => {
                                const active = categoryParam === cat.value;
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setCategory(cat.value)}
                                        style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            letterSpacing: "0.06em",
                                            padding: "8px 18px",
                                            borderRadius: 30,
                                            border: "1.5px solid",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                            fontFamily: "var(--font-body)",
                                            transition: "all 0.18s",
                                            background: active ? "var(--charcoal)" : "transparent",
                                            borderColor: active ? "var(--charcoal)" : "var(--border)",
                                            color: active ? "#fff" : "var(--text-muted)",
                                        }}
                                    >
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right: search + sort */}
                        <div style={{ display: "flex", gap: 10, flexShrink: 0, alignItems: "center" }}>
                            <input
                                type="search"
                                placeholder="Search fragrances…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{
                                    padding: "8px 14px",
                                    border: "1.5px solid var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.82rem",
                                    color: "var(--text-main)",
                                    background: "var(--cream)",
                                    outline: "none",
                                    width: 190,
                                    transition: "border-color 0.18s",
                                }}
                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                            />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    padding: "8px 12px",
                                    border: "1.5px solid var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.82rem",
                                    color: "var(--text-main)",
                                    background: "var(--cream)",
                                    outline: "none",
                                    cursor: "pointer",
                                }}
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Product grid ── */}
            <div className="container" style={{ padding: "48px 24px 96px" }}>

                {/* Results count */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 32,
                        flexWrap: "wrap",
                        gap: 8,
                    }}
                >
                    <p style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                        Showing <strong style={{ color: "var(--text-main)" }}>{filtered.length}</strong> of {COLLECTION.items.length} fragrances
                        {categoryParam !== "all" && (
                            <> in <strong style={{ color: "var(--gold)" }}>{categoryParam}</strong></>
                        )}
                    </p>
                    {(categoryParam !== "all" || search.trim() !== "") && (
                        <button
                            onClick={() => { setSearch(""); setCategory("all"); setSortBy("default"); }}
                            style={{
                                fontSize: "0.78rem",
                                fontWeight: 600,
                                color: "var(--gold)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: 0,
                            }}
                        >
                            ✕ Clear filters
                        </button>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✦</div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--text-main)", marginBottom: 8 }}>
                            No fragrances found
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                ) : (
                    <div
                        className="products-grid"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: 24,
                        }}
                    >
                        {filtered.map((item) => (
                            <ProductCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />

            <style>{`
        .cat-scroll::-webkit-scrollbar { display: none; }
        .cat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 480px) { .products-grid { grid-template-columns: 1fr !important; } }
      `}</style>
        </div>
    );
};

export default ProductsPage;
