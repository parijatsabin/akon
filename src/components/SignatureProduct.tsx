import React, { useState } from "react";
import { useSiteData } from "../data/SiteDataProvider";
import { useReveal } from "../hooks/useReveal";
import WhatsAppButton from "./WhatsAppButton";

const TIERS = ["top", "heart", "base"] as const;

const SignatureProduct: React.FC = () => {
    const { featuredProduct: product } = useSiteData();
    const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
    const [activeImage, setActiveImage] = useState(0);

    const headerRef = useReveal<HTMLDivElement>();
    const galleryRef = useReveal<HTMLDivElement>();
    const contentRef = useReveal<HTMLDivElement>();
    const detailRef = useReveal<HTMLDivElement>();

    // Guards against an editor emptying the gallery in the CMS.
    const images = product.images.length > 0 ? product.images : [""];
    const current = images[Math.min(activeImage, images.length - 1)];

    return (
        <section id="signature" className="section bg-white">
            <div className="container">

                {/* ── Header ── */}
                <div ref={headerRef} className="sig-header reveal">
                    <div className="sig-eyebrow-row">
                        <div className="sig-eyebrow-line" />
                        <span className="eyebrow">{product.collection}</span>
                        <div className="sig-eyebrow-line" />
                    </div>
                    <h2 className="section-title-lg">{product.name}</h2>
                    <p className="sig-concentration">
                        {product.concentration} · {product.headlineSize}
                    </p>
                    <div className="sig-price-row">
                        <div className="sig-stars" aria-hidden="true">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="var(--accent)" stroke="none">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            ))}
                        </div>
                        <div className="sig-price-sep" />
                        <span className="sig-price">{product.price}</span>
                    </div>
                </div>

                {/* ── Gallery + buy panel ── */}
                <div className="sig-grid">
                    {/* Gallery */}
                    <div ref={galleryRef} className="reveal sig-gallery">
                        <div className="sig-img-wrap">
                            <img
                                key={current}
                                className="sig-img"
                                src={current}
                                alt={`${product.name} — view ${activeImage + 1} of ${images.length}`}
                                loading="lazy"
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="sig-thumbs" role="tablist" aria-label={`${product.name} images`}>
                                {images.map((src, i) => (
                                    <button
                                        key={src}
                                        role="tab"
                                        aria-selected={i === activeImage}
                                        aria-label={`View image ${i + 1}`}
                                        className={`sig-thumb${i === activeImage ? " is-active" : ""}`}
                                        onClick={() => setActiveImage(i)}
                                    >
                                        <img src={src} alt="" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Buy panel */}
                    <div ref={contentRef} className="sig-content reveal reveal-stagger">
                        <p className="sig-tagline">{product.tagline}</p>
                        <p className="sig-desc">{product.description}</p>

                        {/* Notes */}
                        <div className="sig-notes-box">
                            <div className="eyebrow sig-notes-title">The Olfactory Experience</div>
                            {TIERS.map((tier) => {
                                const layer = product.notes[tier];
                                return (
                                    <div key={tier} className="sig-note-row">
                                        <span className="sig-note-tier">{tier}</span>
                                        <div className="sig-note-detail">
                                            <div className="sig-note-chips">
                                                {layer.ingredients.map((n) => (
                                                    <span key={n} className="note-chip">{n}</span>
                                                ))}
                                            </div>
                                            <p className="sig-note-impression">{layer.impression}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Size */}
                        <div>
                            <div className="sig-size-label">Select Size</div>
                            <div className="sig-size-row">
                                {product.sizes.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(s)}
                                        aria-pressed={s === selectedSize}
                                        className={`size-chip${s === selectedSize ? " active" : ""}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="sig-ctas">
                            <WhatsAppButton
                                name={product.name}
                                size={selectedSize}
                                price={product.price}
                                style={{ flex: "1 1 auto", minWidth: 160 }}
                            />
                        </div>

                        {product.orderingNote && (
                            <p className="sig-ordering-note">{product.orderingNote}</p>
                        )}
                    </div>
                </div>

                {/* ── Highlights / specs / how to wear ── */}
                <div ref={detailRef} className="sig-detail reveal">
                    {product.highlights.length > 0 && (
                        <div className="sig-highlights">
                            {product.highlights.map((h) => (
                                <div key={h.id} className="sig-highlight">
                                    <h3 className="sig-highlight-title">{h.title}</h3>
                                    <p className="sig-highlight-body">{h.body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="sig-detail-grid">
                        {product.specs.length > 0 && (
                            <div>
                                <h3 className="sig-detail-heading">Details &amp; Specifications</h3>
                                <dl className="sig-specs">
                                    {product.specs.map((s) => (
                                        <div key={s.label} className="sig-spec-row">
                                            <dt>{s.label}</dt>
                                            <dd>{s.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {product.usage.length > 0 && (
                            <div>
                                <h3 className="sig-detail-heading">How to Wear It</h3>
                                <ol className="sig-usage">
                                    {product.usage.map((u, i) => (
                                        <li key={u.id} className="sig-usage-step">
                                            <span className="sig-usage-num">{String(i + 1).padStart(2, "0")}</span>
                                            <div>
                                                <div className="sig-usage-title">{u.title}</div>
                                                <p className="sig-usage-body">{u.body}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Composition & care ──
                    Laid out as the back of the bottle: ingredients, then the
                    handling warning, then the guidance for reactive skin. The
                    ingredient list is the part an allergy sufferer actually
                    reads, so it sits with the product rather than in a policy
                    page nobody opens. */}
                {(product.ingredients.length > 0 || product.safetyWarning || product.allergenNote) && (
                    <div id="composition" className="sig-label reveal">
                        <div className="sig-label-head">
                            <h3 className="sig-detail-heading">Composition &amp; Care</h3>
                            <span className="sig-label-note">As printed on the bottle</span>
                        </div>

                        {product.ingredients.length > 0 && (
                            <div className="sig-label-block">
                                <h4 className="sig-label-key">Ingredients</h4>
                                <p className="sig-ingredients">{product.ingredients.join(", ")}.</p>
                            </div>
                        )}

                        {product.safetyWarning && (
                            <p className="sig-warning">
                                <span className="sig-warning-tag">Warning</span>
                                {product.safetyWarning}
                            </p>
                        )}

                        {product.allergenNote && (
                            <div className="sig-label-block">
                                <h4 className="sig-label-key">Sensitive skin</h4>
                                <p className="sig-allergen">{product.allergenNote}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default SignatureProduct;
