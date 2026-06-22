import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../PublicSite";
import type { ProductItem } from "../admin/types/cms.types";

const SIZES = ["100 ml", "50 ml", "30 ml", "10 ml"];
const VISIBLE = 4;
const AUTO_DELAY = 3500;
const RESUME_AFTER = 6000;

/* ── Product card ───────────────────────────────────────────── */
const ProductCard: React.FC<{ item: ProductItem }> = ({ item }) => {
    const [selectedSize, setSelectedSize] = useState(SIZES[0]);
    const [hovered, setHovered] = useState(false);

    return (
        <div
            style={{ display: "flex", flexDirection: "column", background: "#fff", minWidth: 0, borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)", transition: "box-shadow 0.28s, transform 0.28s", boxShadow: hovered ? "var(--shadow-gold)" : "var(--shadow)", transform: hovered ? "translateY(-4px)" : "translateY(0)" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", background: "var(--parchment)", overflow: "hidden" }}>
                <img
                    src={item.imageUrl} alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.55s ease", display: "block", transform: hovered ? "scale(1.06)" : "scale(1)" }}
                />
                {item.badge && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "var(--charcoal)", color: "var(--gold-light)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", padding: "5px 12px", borderRadius: "3px" }}>
                        {item.badge}
                    </div>
                )}
            </div>

            {/* Body */}
            <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 5 }}>
                    {item.collection}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, color: "var(--text-main)", marginBottom: 6, lineHeight: 1.25 }}>
                    {item.name}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.92rem", color: "var(--gold-dim)", marginBottom: 14 }}>
                    {item.price}
                </div>

                {/* Sizes */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {SIZES.map((s) => (
                        <button
                            key={s} onClick={() => setSelectedSize(s)}
                            style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.06em", padding: "5px 10px", borderRadius: "3px", border: "1px solid", cursor: "pointer", transition: "all 0.18s", fontFamily: "var(--font-body)", background: s === selectedSize ? "var(--charcoal)" : "transparent", borderColor: s === selectedSize ? "var(--charcoal)" : "var(--border)", color: s === selectedSize ? "#fff" : "var(--text-muted)" }}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* CTA */}
                <button
                    style={{ width: "100%", padding: "12px 0", background: "var(--gold)", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.09em", textTransform: "uppercase", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", transition: "background 0.22s, box-shadow 0.22s", marginTop: "auto", boxShadow: "0 4px 14px rgba(162,127,63,0.22)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold-dim)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(162,127,63,0.35)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(162,127,63,0.22)"; }}
                >
                    Add To Cart
                </button>
            </div>
        </div>
    );
};

/* ── Carousel ──────────────────────────────────────────────── */
const Collection: React.FC = () => {
    const { collection: COLLECTION } = useSiteData();
    const items = COLLECTION.items;
    const total = items.length;
    const maxStart = Math.max(0, total - VISIBLE);

    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (resumeRef.current) clearTimeout(resumeRef.current);
    };

    const startAuto = useCallback(() => {
        timerRef.current = setInterval(() => {
            setIndex((i) => (i >= maxStart ? 0 : i + 1));
        }, AUTO_DELAY);
    }, [maxStart]);

    const stopAuto = useCallback(() => { clearTimers(); }, []);
    const resumeAuto = useCallback(() => { startAuto(); }, [startAuto]);

    useEffect(() => {
        setIndex(0);
        startAuto();
        return clearTimers;
    }, [startAuto, items.length]);

    const go = (newIndex: number) => {
        stopAuto();
        setIndex(Math.max(0, Math.min(newIndex, maxStart)));
        resumeRef.current = setTimeout(resumeAuto, RESUME_AFTER);
    };

    const translatePct = -(index * (100 / VISIBLE));

    return (
        <section id="collection" className="section" style={{ background: "var(--parchment)" }}>
            <div className="container">

                <div style={{ textAlign: "center", marginBottom: 52 }}>
                    <span className="tag">Curated for You</span>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, fontStyle: "italic", color: "var(--text-main)", lineHeight: 1.15 }}>
                        {COLLECTION.headline}
                    </h2>
                </div>

                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    {/* Left arrow */}
                    <button
                        onClick={() => go(index - 1)} aria-label="Previous" disabled={index === 0}
                        style={{ position: "absolute", left: -36, zIndex: 10, width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === 0 ? "not-allowed" : "pointer", color: "var(--text-main)", boxShadow: "var(--shadow)", transition: "all 0.22s", flexShrink: 0, opacity: index === 0 ? 0.35 : 1 }}
                        onMouseEnter={(e) => { if (index !== 0) e.currentTarget.style.borderColor = "var(--gold)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Viewport */}
                    <div style={{ overflow: "hidden", width: "100%" }}>
                        <div style={{ display: "flex", gap: 20, transform: `translateX(calc(${translatePct}% - ${(index * 20) / VISIBLE}px))`, transition: "transform 0.58s cubic-bezier(0.25, 0.46, 0.45, 0.94)", willChange: "transform" }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ flex: `0 0 calc(${100 / VISIBLE}% - ${(20 * (VISIBLE - 1)) / VISIBLE}px)`, minWidth: 0 }}>
                                    <ProductCard item={item} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right arrow */}
                    <button
                        onClick={() => go(index + 1)} aria-label="Next" disabled={index === maxStart}
                        style={{ position: "absolute", right: -36, zIndex: 10, width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === maxStart ? "not-allowed" : "pointer", color: "var(--text-main)", boxShadow: "var(--shadow)", transition: "all 0.22s", flexShrink: 0, opacity: index === maxStart ? 0.35 : 1 }}
                        onMouseEnter={(e) => { if (index !== maxStart) e.currentTarget.style.borderColor = "var(--gold)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Dots */}
                <div style={{ marginTop: 36, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                    {Array.from({ length: maxStart + 1 }).map((_, i) => (
                        <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} style={{ padding: 0, border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center" }}>
                            <div style={{ width: i === index ? 32 : 8, height: 8, borderRadius: 4, background: i === index ? "var(--gold)" : "var(--border)", transition: "all 0.38s ease" }} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Collection;
