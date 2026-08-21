/**
 * Product blocks.
 *
 * These were one 227-line component that rendered the whole product on the
 * homepage: gallery, description, notes, sizes, ordering, highlights, specs,
 * how-to-wear and composition. Splitting them out lets the homepage teaser and
 * the /fragrance page each use the parts they need, with no markup living in
 * two places.
 *
 * Each block takes the product it renders as a prop, so a page could render a
 * product other than the featured one. Headings are read from context instead:
 * they are one global set, and threading them through every call site would be
 * noise at each one.
 */

import React, { useState } from "react";
import Reveal from "../Reveal";
import { useSiteData } from "../../data/SiteDataProvider";
import type { ProductItem } from "../../data/types";

const TIERS = ["top", "heart", "base"] as const;

// ── Gallery ───────────────────────────────────────────────────
export const ProductGallery: React.FC<{ product: ProductItem }> = ({ product }) => {
    const [active, setActive] = useState(0);

    // Guards against an editor emptying the gallery in the CMS.
    const images = product.images.length > 0 ? product.images : [""];
    const current = images[Math.min(active, images.length - 1)];

    return (
        <Reveal className="sig-gallery">
            <div className="sig-img-wrap">
                <img
                    key={current}
                    className="sig-img"
                    src={current}
                    alt={`${product.name} — view ${active + 1} of ${images.length}`}
                    loading="lazy"
                />
            </div>

            {images.length > 1 && (
                <div className="sig-thumbs" role="tablist" aria-label={`${product.name} images`}>
                    {images.map((src, i) => (
                        <button
                            key={src}
                            role="tab"
                            aria-selected={i === active}
                            aria-label={`View image ${i + 1}`}
                            className={`sig-thumb${i === active ? " is-active" : ""}`}
                            onClick={() => setActive(i)}
                        >
                            <img src={src} alt="" loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
        </Reveal>
    );
};

// ── Name, concentration, price ────────────────────────────────
export const ProductHeader: React.FC<{ product: ProductItem; as?: "h1" | "h2" }> = ({
    product,
    as: Heading = "h2",
}) => {
    return (
        <Reveal className="sig-header">
            <div className="sig-eyebrow-row">
                <div className="sig-eyebrow-line" />
                <span className="eyebrow">{product.collection}</span>
                <div className="sig-eyebrow-line" />
            </div>
            <Heading className="section-title-lg">{product.name}</Heading>
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
        </Reveal>
    );
};

// ── Notes pyramid ─────────────────────────────────────────────
export const ProductNotes: React.FC<{ product: ProductItem }> = ({ product }) => {
    const { productLabels: L } = useSiteData();
    return (
    <div className="sig-notes-box">
        <div className="eyebrow sig-notes-title">{L.notesTitle}</div>
        {TIERS.map((tier) => {
            const layer = product.notes[tier];
            if (!layer) return null;
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
    );
};

// ── Size picker ───────────────────────────────────────────────
export const ProductSizes: React.FC<{
    sizes: string[];
    selected: string;
    onSelect: (size: string) => void;
}> = ({ sizes, selected, onSelect }) => {
    const { productLabels: L } = useSiteData();
    if (sizes.length === 0) return null;
    return (
        <div>
            <div className="sig-size-label">{L.sizeLabel}</div>
            <div className="sig-size-row">
                {sizes.map((s) => (
                    <button
                        key={s}
                        onClick={() => onSelect(s)}
                        aria-pressed={s === selected}
                        className={`size-chip${s === selected ? " active" : ""}`}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
};

// ── Highlights ────────────────────────────────────────────────
export const ProductHighlights: React.FC<{ product: ProductItem }> = ({ product }) => {
    if (product.highlights.length === 0) return null;
    return (
        <div className="sig-highlights">
            {product.highlights.map((h) => (
                <div key={h.id} className="sig-highlight">
                    <h3 className="sig-highlight-title">{h.title}</h3>
                    <p className="sig-highlight-body">{h.body}</p>
                </div>
            ))}
        </div>
    );
};

// ── Specifications ────────────────────────────────────────────
export const ProductSpecs: React.FC<{ product: ProductItem }> = ({ product }) => {
    const { productLabels: L } = useSiteData();
    if (product.specs.length === 0) return null;
    return (
        <div>
            <h2 className="sig-detail-heading">{L.specsTitle}</h2>
            <dl className="sig-specs">
                {product.specs.map((s) => (
                    <div key={s.label} className="sig-spec-row">
                        <dt>{s.label}</dt>
                        <dd>{s.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
};

// ── How to wear it ────────────────────────────────────────────
export const ProductUsage: React.FC<{ product: ProductItem }> = ({ product }) => {
    const { productLabels: L } = useSiteData();
    if (product.usage.length === 0) return null;
    return (
        <div>
            <h2 className="sig-detail-heading">{L.usageTitle}</h2>
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
    );
};

// ── Composition & care ────────────────────────────────────────
/**
 * Laid out as the back of the bottle. The ingredient list is the part an
 * allergy sufferer actually reads, so it stays with the product rather than
 * living in a policy page. #composition is linked from the footer.
 */
export const ProductComposition: React.FC<{ product: ProductItem }> = ({ product }) => {
    const { productLabels: L } = useSiteData();
    const has =
        product.ingredients.length > 0 || product.safetyWarning || product.allergenNote;
    if (!has) return null;

    return (
        <Reveal id="composition" className="sig-label">
            <div className="sig-label-head">
                <h2 className="sig-detail-heading">{L.compositionTitle}</h2>
                <span className="sig-label-note">{L.compositionNote}</span>
            </div>

            {product.ingredients.length > 0 && (
                <div className="sig-label-block">
                    <h3 className="sig-label-key">{L.ingredientsLabel}</h3>
                    <p className="sig-ingredients">{product.ingredients.join(", ")}.</p>
                </div>
            )}

            {product.safetyWarning && (
                <p className="sig-warning">
                    <span className="sig-warning-tag">{L.warningLabel}</span>
                    {product.safetyWarning}
                </p>
            )}

            {product.allergenNote && (
                <div className="sig-label-block">
                    <h3 className="sig-label-key">{L.sensitiveSkinLabel}</h3>
                    <p className="sig-allergen">{product.allergenNote}</p>
                </div>
            )}
        </Reveal>
    );
};
