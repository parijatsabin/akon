import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const SIZES = ["100 ml", "50 ml", "30 ml", "10 ml"];

const NoteChip: React.FC<{ label: string }> = ({ label }) => (
    <span
        style={{
            display: "inline-block",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            padding: "5px 13px",
            borderRadius: 30,
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            background: "var(--warm-white)",
        }}
    >
        {label}
    </span>
);

const StarIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const SignatureProduct: React.FC = () => {
    const { featuredProduct: product } = useSiteData();
    const [selectedSize, setSelectedSize] = useState(SIZES[0]);
    const [imgHovered, setImgHovered] = useState(false);

    return (
        <section id="signature" className="section" style={{ background: "var(--cream)", paddingBottom: 96 }}>
            <div className="container">

                {/* ── Section header — premium treatment ── */}
                <div style={{ textAlign: "center", marginBottom: 72 }}>
                    {/* eyebrow */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 32, height: 1, background: "var(--gold)", opacity: 0.7 }} />
                        <span style={{
                            fontSize: "0.70rem",
                            fontWeight: 700,
                            letterSpacing: "0.26em",
                            textTransform: "uppercase",
                            color: "var(--gold)",
                        }}>
                            The Signature Collection
                        </span>
                        <div style={{ width: 32, height: 1, background: "var(--gold)", opacity: 0.7 }} />
                    </div>

                    {/* main headline */}
                    <h2 style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                        fontWeight: 700,
                        fontStyle: "italic",
                        color: "var(--text-main)",
                        lineHeight: 1.1,
                        marginBottom: 18,
                        letterSpacing: "-0.01em",
                    }}>
                        {product.name}
                    </h2>

                    {/* Stars + price inline */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                        </div>
                        <span style={{ width: 1, height: 20, background: "var(--border)", display: "inline-block" }} />
                        <span style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: "1.25rem",
                            color: "var(--gold-dim)",
                            letterSpacing: "0.03em",
                        }}>
                            {product.price}
                        </span>
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div
                    className="sig-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 64,
                        alignItems: "center",
                    }}
                >
                    {/* LEFT — Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

                        {/* Collection label */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                letterSpacing: "0.10em",
                                textTransform: "uppercase",
                                color: "var(--gold)",
                            }}>
                                {product.collection}
                            </span>
                        </div>

                        {/* Gold divider */}
                        <div style={{ width: 56, height: 2, background: "var(--gold)", borderRadius: 2, opacity: 0.7 }} />

                        {/* Description */}
                        <p
                            style={{
                                fontSize: "0.96rem",
                                lineHeight: 1.85,
                                color: "var(--text-muted)",
                            }}
                        >
                            {product.description}
                        </p>

                        {/* Fragrance Notes */}
                        <div
                            style={{
                                background: "var(--parchment)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "22px 24px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                    color: "var(--gold)",
                                    marginBottom: 16,
                                }}
                            >
                                Fragrance Notes
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {(
                                    [
                                        { tier: "Top", notes: product.notes.top },
                                        { tier: "Heart", notes: product.notes.heart },
                                        { tier: "Base", notes: product.notes.base },
                                    ] as const
                                ).map(({ tier, notes }) => (
                                    <div key={tier} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        <span
                                            style={{
                                                fontSize: "0.70rem",
                                                fontWeight: 700,
                                                letterSpacing: "0.08em",
                                                textTransform: "uppercase",
                                                color: "var(--text-faint)",
                                                minWidth: 42,
                                                paddingTop: 4,
                                            }}
                                        >
                                            {tier}
                                        </span>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {notes.map((n) => <NoteChip key={n} label={n} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size selector */}
                        <div>
                            <div
                                style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.10em",
                                    textTransform: "uppercase",
                                    color: "var(--text-main)",
                                    marginBottom: 12,
                                }}
                            >
                                Select Size
                            </div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        style={{
                                            fontSize: "0.78rem",
                                            fontWeight: 600,
                                            letterSpacing: "0.06em",
                                            padding: "10px 20px",
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

                        {/* CTA buttons */}
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 4 }}>
                            <button
                                className="btn btn-gold"
                                style={{ flex: "1 1 auto", minWidth: 160, justifyContent: "center" }}
                            >
                                Add to Cart
                            </button>
                            <Link
                                to="/products"
                                className="btn btn-outline"
                                style={{
                                    flex: "1 1 auto",
                                    minWidth: 160,
                                    justifyContent: "center",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                Explore Full Collection
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — Product Image */}
                    <div
                        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        onMouseEnter={() => setImgHovered(true)}
                        onMouseLeave={() => setImgHovered(false)}
                    >
                        <div
                            style={{
                                position: "relative",
                                width: "100%",
                                maxWidth: 460,
                                borderRadius: "var(--radius-lg)",
                                overflow: "hidden",
                                boxShadow: imgHovered
                                    ? "0 32px 80px rgba(162,127,63,0.32), 0 8px 24px rgba(0,0,0,0.14)"
                                    : "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(162,127,63,0.12)",
                                transition: "box-shadow 0.5s ease, transform 0.5s ease",
                                transform: imgHovered ? "translateY(-8px)" : "translateY(0)",
                                aspectRatio: "3/4",
                            }}
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
                                    transform: imgHovered ? "scale(1.04)" : "scale(1)",
                                }}
                            />

                            {/* Overlay gradient for luxury feel */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(to top, rgba(13,12,11,0.45) 0%, transparent 50%)",
                                    pointerEvents: "none",
                                }}
                            />

                            {/* Price badge on image */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: 24,
                                    left: 24,
                                    background: "rgba(253,250,245,0.92)",
                                    backdropFilter: "blur(12px)",
                                    borderRadius: "var(--radius-sm)",
                                    padding: "10px 18px",
                                    border: "1px solid rgba(162,127,63,0.25)",
                                }}
                            >
                                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 2 }}>
                                    Starting from
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gold-dim)" }}>
                                    {product.price}
                                </div>
                            </div>

                            {/* Gold corner accent */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: 20,
                                    right: 20,
                                    width: 44,
                                    height: 44,
                                    borderRadius: "50%",
                                    background: "var(--gold)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <style>{`
        @media (max-width: 900px) {
          .sig-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .sig-grid > div:last-child {
            order: -1;
          }
        }
      `}</style>
        </section>
    );
};

export default SignatureProduct;
