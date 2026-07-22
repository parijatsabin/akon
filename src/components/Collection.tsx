import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../PublicSite";
import type { ProductItem } from "../admin/types/cms.types";
import { useVisibleCount } from "../hooks/useVisibleCount";

const AUTO_DELAY = 3500;
const RESUME_AFTER = 6000;

const ProductCard: React.FC<{ item: ProductItem; sizes: string[] }> = ({ item, sizes }) => {
    const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");

    return (
        <div className="product-card" style={{ minWidth: 0 }}>
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
                {item.badge && <span className="card-badge" style={{ position: "absolute", top: 12, left: 12 }}>{item.badge}</span>}
            </div>
            <div className="product-card-body">
                <div className="product-card-collection">{item.collection}</div>
                <div className="product-card-name">{item.name}</div>
                <div className="product-card-price">{item.price}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 10px" }}>
                    {sizes.map((s) => (
                        <button key={s} onClick={() => setSelectedSize(s)} className={`size-chip${s === selectedSize ? " active" : ""}`}>{s}</button>
                    ))}
                </div>
                <button className="btn btn-gold" style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}>Add To Cart</button>
            </div>
        </div>
    );
};

const Collection: React.FC = () => {
    const { collection: COLLECTION } = useSiteData();

    // Respect visibility and order from CMS
    const items = [...COLLECTION.items]
        .filter((p) => p.visible)
        .sort((a, b) => a.order - b.order);

    const sizes = COLLECTION.productSizes;
    const visibleCount = useVisibleCount({ sm: 480, md: 1024, def: 4 });
    const maxStart = Math.max(0, items.length - visibleCount);
    const gap = 20;

    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (resumeRef.current) clearTimeout(resumeRef.current);
    };
    const startAuto = useCallback(() => { timerRef.current = setInterval(() => setIndex((i) => (i >= maxStart ? 0 : i + 1)), AUTO_DELAY); }, [maxStart]);
    const resumeAuto = useCallback(() => startAuto(), [startAuto]);

    useEffect(() => { setIndex(0); startAuto(); return clearTimers; }, [startAuto, items.length, visibleCount]);
    useEffect(() => { setIndex((i) => Math.min(i, maxStart)); }, [maxStart]);

    const go = (n: number) => {
        clearTimers();
        setIndex(Math.max(0, Math.min(n, maxStart)));
        resumeRef.current = setTimeout(resumeAuto, RESUME_AFTER);
    };

    const isMobile = visibleCount <= 2;
    const translatePct = -(index * (100 / visibleCount));
    const translateOffset = index * gap;

    if (items.length === 0) return null;

    return (
        <section id="collection" className="section bg-parchment">
            <div className="container">
                <div className="collection-header">
                    <span className="tag">Curated for You</span>
                    <h2 className="section-title">{COLLECTION.headline}</h2>
                </div>

                {isMobile && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
                        <button className="carousel-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous"><ChevronLeft size={18} /></button>
                        <button className="carousel-btn" onClick={() => go(index + 1)} disabled={index === maxStart} aria-label="Next"><ChevronRight size={18} /></button>
                    </div>
                )}

                <div className="collection-carousel-wrap">
                    {!isMobile && (
                        <button className="carousel-btn collection-arrow-left" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous"><ChevronLeft size={18} /></button>
                    )}
                    <div style={{ overflow: "hidden", width: "100%" }}>
                        <div style={{ display: "flex", gap: `${gap}px`, transform: `translateX(calc(${translatePct}% - ${translateOffset}px))`, transition: "transform 0.58s cubic-bezier(0.25,0.46,0.45,0.94)", willChange: "transform" }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ flex: `0 0 calc(${100 / visibleCount}% - ${gap * (visibleCount - 1) / visibleCount}px)`, minWidth: 0 }}>
                                    <ProductCard item={item} sizes={sizes} />
                                </div>
                            ))}
                        </div>
                    </div>
                    {!isMobile && (
                        <button className="carousel-btn collection-arrow-right" onClick={() => go(index + 1)} disabled={index === maxStart} aria-label="Next"><ChevronRight size={18} /></button>
                    )}
                </div>

                <div className="dot-track">
                    {Array.from({ length: maxStart + 1 }).map((_, i) => (
                        <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} className={`dot${i === index ? " active" : ""}`} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Collection;
