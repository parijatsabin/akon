import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const SignatureProduct: React.FC = () => {
    const { featuredProduct: product, collection: COLLECTION } = useSiteData();
    const sizes = COLLECTION.productSizes;
    const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");

    return (
        <section id="signature" className="section bg-cream">
            <div className="container">

                {/* Header */}
                <div className="sig-header">
                    <div className="sig-eyebrow-row">
                        <div className="sig-eyebrow-line" />
                        <span className="eyebrow">The Signature Collection</span>
                        <div className="sig-eyebrow-line" />
                    </div>
                    <h2 className="section-title-lg" style={{ marginBottom: 18 }}>{product.name}</h2>
                    <div className="sig-price-row">
                        <div style={{ display: "flex", gap: 4 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="var(--gold)" stroke="none">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                        </div>
                        <div className="sig-price-sep" />
                        <span className="sig-price">{product.price}</span>
                    </div>
                </div>

                {/* Two-column */}
                <div className="sig-grid">
                    {/* LEFT */}
                    <div className="sig-content">
                        <span className="eyebrow">{product.collection}</span>
                        <div className="gold-divider" style={{ margin: 0 }} />
                        <p style={{ fontSize: "0.96rem", lineHeight: 1.85, color: "var(--text-muted)" }}>{product.description}</p>

                        {/* Notes */}
                        <div className="sig-notes-box">
                            <div className="eyebrow" style={{ marginBottom: 16 }}>Fragrance Notes</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {([{ tier: "Top", notes: product.notes.top }, { tier: "Heart", notes: product.notes.heart }, { tier: "Base", notes: product.notes.base }] as const).map(({ tier, notes }) => (
                                    <div key={tier} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                        <span style={{ fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-faint)", minWidth: 42, paddingTop: 4 }}>{tier}</span>
                                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                            {notes.map((n) => <span key={n} className="note-chip">{n}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Size selector */}
                        <div>
                            <div className="sig-size-label">Select Size</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {sizes.map((s) => (
                                    <button key={s} onClick={() => setSelectedSize(s)} className={`size-chip${s === selectedSize ? " active" : ""}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="sig-ctas">
                            <button className="btn btn-gold" style={{ flex: "1 1 auto", minWidth: 160, justifyContent: "center" }}>Add to Cart</button>
                            <Link to="/products" className="btn btn-outline" style={{ flex: "1 1 auto", minWidth: 160, justifyContent: "center" }}>
                                Explore Full Collection
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — image */}
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="sig-img-wrap">
                            <img src={product.imageUrl} alt={product.name} />
                            <div className="sig-img-gradient" />
                            <div className="sig-price-badge frosted-badge">
                                <div className="eyebrow" style={{ marginBottom: 2 }}>Starting from</div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gold-dim)" }}>{product.price}</div>
                            </div>
                            <div className="sig-gold-dot">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SignatureProduct;
