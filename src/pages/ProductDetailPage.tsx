import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useSiteData } from "../PublicSite";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SIZES = ["100 ml", "50 ml", "30 ml", "10 ml"];

const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const NoteChip: React.FC<{ label: string }> = ({ label }) => (
    <span style={{ display: "inline-block", fontSize: "0.76rem", fontWeight: 600, letterSpacing: "0.05em", padding: "6px 14px", borderRadius: 30, border: "1px solid var(--border)", color: "var(--text-muted)", background: "var(--warm-white)" }}>
        {label}
    </span>
);

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { collection: COLLECTION } = useSiteData();

    const [selectedSize, setSelectedSize] = useState(SIZES[0]);
    const [qty, setQty] = useState(1);
    const [mainImgHovered, setMainImgHovered] = useState(false);
    const [activeTab, setActiveTab] = useState<"notes" | "story" | "shipping">("notes");

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [id]);

    const product = COLLECTION.items.find((p) => p.id === id);

    if (!product) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
                <Navbar />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: 20, padding: "0 24px" }}>
                    <div style={{ fontSize: "3rem" }}>✦</div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--text-main)" }}>
                        Fragrance Not Found
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                        The fragrance you're looking for doesn't exist or may have been moved.
                    </p>
                    <Link to="/products" className="btn btn-gold">
                        Back to Collection
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    // Related products (same collection, exclude current)
    const related = COLLECTION.items
        .filter((p) => p.id !== product.id && p.collection === product.collection)
        .slice(0, 3);

    return (
        <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
            <Navbar />

            {/* ── Breadcrumb ── */}
            <div
                style={{
                    paddingTop: 96,
                    borderBottom: "1px solid var(--border)",
                    background: "var(--warm-white)",
                }}
            >
                <div className="container" style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.80rem", color: "var(--text-faint)" }}>
                        {[
                            { label: "Home", to: "/" },
                            { label: "Collection", to: "/products" },
                        ].map((crumb, i) => (
                            <React.Fragment key={crumb.to}>
                                {i > 0 && <span>/</span>}
                                <Link
                                    to={crumb.to}
                                    style={{ color: "var(--text-faint)", transition: "color 0.18s" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--gold)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-faint)"; }}
                                >
                                    {crumb.label}
                                </Link>
                            </React.Fragment>
                        ))}
                        <span>/</span>
                        <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{product.name}</span>
                    </div>
                </div>
            </div>

            {/* ── Main product layout ── */}
            <div className="container" style={{ padding: "56px 24px" }}>
                <div
                    className="detail-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 72,
                        alignItems: "flex-start",
                    }}
                >
                    {/* LEFT — Image */}
                    <div>
                        <div
                            style={{
                                position: "relative",
                                borderRadius: "var(--radius-lg)",
                                overflow: "hidden",
                                aspectRatio: "3/4",
                                boxShadow: mainImgHovered
                                    ? "0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(162,127,63,0.18)"
                                    : "0 16px 48px rgba(0,0,0,0.12)",
                                transition: "box-shadow 0.45s ease",
                            }}
                            onMouseEnter={() => setMainImgHovered(true)}
                            onMouseLeave={() => setMainImgHovered(false)}
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    transition: "transform 0.6s ease",
                                    transform: mainImgHovered ? "scale(1.04)" : "scale(1)",
                                }}
                                onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = "/logo.png"; t.style.objectFit = "contain"; t.style.padding = "40px"; t.style.opacity = "0.18"; t.style.transform = "scale(1)"; }}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(to top, rgba(13,12,11,0.35) 0%, transparent 40%)",
                                    pointerEvents: "none",
                                }}
                            />
                            {product.badge && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 20,
                                        left: 20,
                                        background: "var(--charcoal)",
                                        color: "var(--gold-light)",
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.12em",
                                        textTransform: "uppercase",
                                        padding: "6px 14px",
                                        borderRadius: 3,
                                    }}
                                >
                                    {product.badge}
                                </div>
                            )}
                        </div>

                        {/* Back button */}
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                marginTop: 20,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: "0.80rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 0,
                                transition: "color 0.18s",
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            Back to Collection
                        </button>
                    </div>

                    {/* RIGHT — Product Info */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                        {/* Category + Badge */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)" }}>
                                {product.collection}
                            </span>
                        </div>

                        {/* Name */}
                        <div>
                            <h1
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "clamp(2rem, 3.5vw, 3rem)",
                                    fontWeight: 700,
                                    color: "var(--text-main)",
                                    lineHeight: 1.1,
                                    marginBottom: 12,
                                }}
                            >
                                {product.name}
                            </h1>
                            {/* Stars row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ display: "flex", gap: 3 }}>
                                    {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} />)}
                                </div>
                                <span style={{ fontSize: "0.80rem", color: "var(--text-muted)" }}>5.0 (48 reviews)</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gold-dim)" }}>
                            {product.price}
                        </div>

                        <div style={{ width: 48, height: 1.5, background: "var(--gold)", borderRadius: 2 }} />

                        {/* Description */}
                        <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "var(--text-muted)" }}>
                            {product.description}
                        </p>

                        {/* Size selector */}
                        <div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-main)", marginBottom: 12 }}>
                                Select Size
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        style={{
                                            fontSize: "0.80rem",
                                            fontWeight: 600,
                                            letterSpacing: "0.06em",
                                            padding: "10px 22px",
                                            borderRadius: "var(--radius-sm)",
                                            border: "1.5px solid",
                                            cursor: "pointer",
                                            transition: "all 0.18s",
                                            fontFamily: "var(--font-body)",
                                            background: s === selectedSize ? "var(--charcoal)" : "transparent",
                                            borderColor: s === selectedSize ? "var(--charcoal)" : "var(--border)",
                                            color: s === selectedSize ? "#fff" : "var(--text-muted)",
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity + Add to cart */}
                        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    border: "1.5px solid var(--border)",
                                    borderRadius: "var(--radius-sm)",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                }}
                            >
                                <button
                                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                                    style={{ width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--parchment)", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--text-muted)", transition: "background 0.18s" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--parchment)"; }}
                                >
                                    −
                                </button>
                                <span style={{ width: 44, textAlign: "center", fontWeight: 700, fontSize: "0.92rem", color: "var(--text-main)" }}>
                                    {qty}
                                </span>
                                <button
                                    onClick={() => setQty((q) => q + 1)}
                                    style={{ width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--parchment)", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "var(--text-muted)", transition: "background 0.18s" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--border)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--parchment)"; }}
                                >
                                    +
                                </button>
                            </div>
                            <button
                                className="btn btn-gold"
                                style={{ flex: 1, minWidth: 160, justifyContent: "center" }}
                            >
                                Add to Cart
                            </button>
                        </div>

                        {/* Trust signals */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                padding: "20px",
                                background: "var(--parchment)",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            {[
                                { icon: "✓", text: "In Stock — ships within 2–3 business days" },
                                { icon: "✦", text: "Free shipping on orders over NPR 5,000" },
                                { icon: "✦", text: "Authentic ANOK fragrance, crafted in Nepal" },
                                { icon: "✦", text: "30-day satisfaction guarantee" },
                            ].map((item) => (
                                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }}>{item.icon}</span>
                                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Info tabs */}
                        <div>
                            <div style={{ display: "flex", borderBottom: "2px solid var(--border)", marginBottom: 20, gap: 0 }}>
                                {(["notes", "story", "shipping"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: "10px 20px",
                                            fontFamily: "var(--font-body)",
                                            fontSize: "0.78rem",
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            textTransform: "uppercase",
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            color: activeTab === tab ? "var(--gold)" : "var(--text-faint)",
                                            borderBottom: activeTab === tab ? "2px solid var(--gold)" : "2px solid transparent",
                                            marginBottom: -2,
                                            transition: "color 0.18s",
                                        }}
                                    >
                                        {tab === "notes" ? "Fragrance Notes" : tab === "story" ? "Craftsmanship" : "Shipping"}
                                    </button>
                                ))}
                            </div>

                            {activeTab === "notes" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    {(
                                        [
                                            { tier: "Top Notes", color: "#8bb4c8", notes: product.notes.top },
                                            { tier: "Heart Notes", color: "#c89eb4", notes: product.notes.heart },
                                            { tier: "Base Notes", color: "#b4956e", notes: product.notes.base },
                                        ] as const
                                    ).map(({ tier, color, notes }) => (
                                        <div key={tier}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                                                <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)" }}>
                                                    {tier}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                {notes.map((n) => <NoteChip key={n} label={n} />)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "story" && (
                                <div style={{ fontSize: "0.88rem", lineHeight: 1.85, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 12 }}>
                                    <p>Each bottle of {product.name} is the result of months of meticulous blending by our in-house master perfumers in Kathmandu.</p>
                                    <p>We source only the finest raw materials — from Bulgarian rose absolutes to aged Arabian oud — ensuring every spray carries the full weight of its ingredients.</p>
                                    <p>ANOK fragrances are never rushed. They are matured, refined, and bottled only when they meet our exacting standards of excellence.</p>
                                </div>
                            )}

                            {activeTab === "shipping" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                    {[
                                        { label: "Standard Delivery", value: "2–3 business days within Kathmandu" },
                                        { label: "Nationwide", value: "5–7 business days" },
                                        { label: "Free Shipping", value: "On orders over NPR 5,000" },
                                        { label: "Returns", value: "30 days, unopened & sealed" },
                                    ].map((row) => (
                                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-main)" }}>{row.label}</span>
                                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Related Products ── */}
                {related.length > 0 && (
                    <div style={{ marginTop: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
                            <div>
                                <span className="tag">More from</span>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, fontStyle: "italic", color: "var(--text-main)", lineHeight: 1.15 }}>
                                    {product.collection}
                                </h3>
                            </div>
                            <Link
                                to={`/products?category=${encodeURIComponent(product.collection)}`}
                                style={{ fontSize: "0.80rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--gold)", display: "flex", alignItems: "center", gap: 6 }}
                            >
                                View All
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div
                            className="related-grid"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 24,
                            }}
                        >
                            {related.map((item) => (
                                <Link key={item.id} to={`/products/${item.id}`} style={{ textDecoration: "none" }}>
                                    <div
                                        style={{ background: "#fff", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)", transition: "box-shadow 0.28s, transform 0.28s", boxShadow: "var(--shadow)" }}
                                        onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "var(--shadow-gold)"; el.style.transform = "translateY(-4px)"; }}
                                        onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "var(--shadow)"; el.style.transform = "translateY(0)"; }}
                                    >
                                        <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                                            <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s" }}
                                                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)"; }}
                                                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
                                                onError={(e) => { const t = e.currentTarget; t.onerror = null; t.src = "/logo.png"; t.style.objectFit = "contain"; t.style.padding = "28px"; t.style.opacity = "0.18"; }}
                                            />
                                        </div>
                                        <div style={{ padding: "14px 16px 18px" }}>
                                            <div style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 4 }}>{item.collection}</div>
                                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--text-main)", marginBottom: 4 }}>{item.name}</div>
                                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--gold-dim)" }}>{item.price}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            <style>{`
        @media (max-width: 900px) {
          .detail-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .related-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .related-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default ProductDetailPage;
