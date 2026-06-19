import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLECTION } from "../data/siteContent";

const SIZES = ["100 ml", "50 ml", "30 ml", "10 ml"];
const VISIBLE = 4;      // cards visible at once
const AUTO_DELAY = 3500;  // ms per slide
const RESUME_AFTER = 6000;// ms before auto resumes after manual interaction

// ── Single product card ──────────────────────────────────────
interface Item {
    id: string; name: string; collection: string; price: string;
    badge: string | null; imageUrl: string; productUrl: string;
    description: string; notes: { top: string[]; heart: string[]; base: string[] };
}

const ProductCard: React.FC<{ item: Item }> = ({ item }) => {
    const [selectedSize, setSelectedSize] = useState(SIZES[0]);
    return (
        <div style={{ display: "flex", flexDirection: "column", background: "#fff", minWidth: 0 }}>
            {/* Image */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", background: "#f0ecec", overflow: "hidden", marginBottom: 14, borderRadius: 2 }}>
                <img
                    src={item.imageUrl} alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", display: "block" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
                {item.badge && (
                    <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.93)", color: "#5a2d2d", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.04em", padding: "4px 10px", borderRadius: 2 }}>
                        {item.badge}
                    </div>
                )}
            </div>
            {/* Name */}
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "#2a1a14", marginBottom: 4 }}>{item.name}</div>
            {/* Price */}
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.95rem", color: "#5a2d2d", marginBottom: 12 }}>{item.price}</div>
            {/* Sizes */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {SIZES.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} style={{
                        fontSize: "0.68rem", fontWeight: 500, padding: "4px 9px", borderRadius: 3, border: "1px solid",
                        cursor: "pointer", transition: "all 0.18s", fontFamily: "var(--font-body)",
                        background: s === selectedSize ? "#5a2d2d" : "transparent",
                        borderColor: s === selectedSize ? "#5a2d2d" : "#c0a89a",
                        color: s === selectedSize ? "#fff" : "#7a5a52",
                    }}>{s}</button>
                ))}
            </div>
            {/* CTA */}
            <button style={{ width: "100%", padding: "11px 0", background: "#5a2d2d", color: "#fff", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.82rem", letterSpacing: "0.06em", border: "none", borderRadius: 3, cursor: "pointer", transition: "background 0.2s", marginTop: "auto" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#3e1e1e")}
                onMouseLeave={e => (e.currentTarget.style.background = "#5a2d2d")}>
                Add To Cart
            </button>
        </div>
    );
};

// ── Main carousel ────────────────────────────────────────────
const Collection: React.FC = () => {
    const items = COLLECTION.items;
    const total = items.length;
    const maxStart = total - VISIBLE;  // 0–4 for 8 items

    const [index, setIndex] = useState(0);   // 0-based slide index (0..maxStart)
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0); // 0-100 for progress bar
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (progressRef.current) clearInterval(progressRef.current);
        if (resumeRef.current) clearTimeout(resumeRef.current);
    };

    const startAuto = useCallback(() => {
        setProgress(0);
        // progress ticks every 30ms → 100 steps over AUTO_DELAY ms
        const step = 100 / (AUTO_DELAY / 30);
        progressRef.current = setInterval(() => {
            setProgress(p => Math.min(p + step, 100));
        }, 30);
        timerRef.current = setInterval(() => {
            setIndex(i => (i >= maxStart ? 0 : i + 1));
            setProgress(0);
        }, AUTO_DELAY);
    }, [maxStart]);

    const stopAuto = useCallback(() => {
        clearTimers();
        setPaused(true);
        setProgress(0);
    }, []);

    const resumeAuto = useCallback(() => {
        setPaused(false);
        startAuto();
    }, [startAuto]);

    useEffect(() => {
        startAuto();
        return clearTimers;
    }, [startAuto]);

    const go = (newIndex: number) => {
        stopAuto();
        setIndex(Math.max(0, Math.min(newIndex, maxStart)));
        resumeRef.current = setTimeout(resumeAuto, RESUME_AFTER);
    };

    // Translate = index * (100% / VISIBLE) per card width
    const translatePct = -(index * (100 / VISIBLE));

    return (
        <section id="collection" className="section" style={{ background: "#fff" }}>
            <div className="container">

                {/* Heading */}
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 600, fontStyle: "italic", color: "var(--charcoal)", textAlign: "center", marginBottom: 40 }}>
                    {COLLECTION.headline}
                </h2>

                {/* Carousel outer — clips the sliding track */}
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>

                    {/* Left arrow */}
                    <button onClick={() => go(index - 1)} aria-label="Previous"
                        style={{ position: "absolute", left: -28, zIndex: 10, width: 40, height: 40, border: "1.5px solid #ccc", borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--charcoal)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.2s", flexShrink: 0, opacity: index === 0 ? 0.4 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f0eb"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                        <ChevronLeft size={18} />
                    </button>

                    {/* Clipping viewport */}
                    <div style={{ overflow: "hidden", width: "100%" }}>
                        {/* Sliding track — holds ALL cards side by side */}
                        <div style={{
                            display: "flex",
                            gap: 24,
                            transform: `translateX(calc(${translatePct}% - ${index * 24 / VISIBLE}px))`,
                            transition: "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                            willChange: "transform",
                        }}>
                            {items.map(item => (
                                <div key={item.id} style={{ flex: `0 0 calc(${100 / VISIBLE}% - ${24 * (VISIBLE - 1) / VISIBLE}px)`, minWidth: 0 }}>
                                    <ProductCard item={item} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right arrow */}
                    <button onClick={() => go(index + 1)} aria-label="Next"
                        style={{ position: "absolute", right: -28, zIndex: 10, width: 40, height: 40, border: "1.5px solid #ccc", borderRadius: 4, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--charcoal)", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", transition: "all 0.2s", flexShrink: 0, opacity: index === maxStart ? 0.4 : 1 }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f0eb"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* ── Indicators ── */}
                <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

                    {/* Progress bar
                    {!paused && (
                        <div style={{ width: 160, height: 2, background: "#e8ddd6", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${progress}%`, background: "#5a2d2d", borderRadius: 2, transition: "width 0.03s linear" }} />
                        </div>
                    )} */}

                    {/* Dot indicators */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {Array.from({ length: maxStart + 1 }).map((_, i) => (
                            <button key={i} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}`}
                                style={{ padding: 0, border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center" }}>
                                <div style={{
                                    width: i === index ? 28 : 8,
                                    height: 8,
                                    borderRadius: 4,
                                    background: i === index ? "#5a2d2d" : "#d4c4bc",
                                    transition: "all 0.35s ease",
                                }} />
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Collection;
