import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLECTION } from "../data/siteContent";

const Collection: React.FC = () => {
    const [active, setActive] = useState(0);
    const items = COLLECTION.items;
    const prev = () => setActive((a) => (a - 1 + items.length) % items.length);
    const next = () => setActive((a) => (a + 1) % items.length);

    return (
        <section id="collection" className="section" style={{ background: "var(--warm-white)" }}>
            <div className="container">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "var(--charcoal)" }}>
                        {COLLECTION.headline}
                    </h2>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={prev} className="btn btn-outline" style={{ padding: "8px 12px", borderRadius: "50%" }} aria-label="Previous">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={next} className="btn btn-gold" style={{ padding: "8px 12px", borderRadius: "50%" }} aria-label="Next">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Cards grid */}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(4, 1fr)", 
                    gap: 24,
                }}>
                    {items.map((item, i) => (
                        <a key={item.id} href={item.productUrl}
                            style={{
                                textDecoration: "none",
                                background: "transparent",
                                borderRadius: 8,
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                                cursor: "pointer",
                                position: "relative",
                            }}
                            onMouseEnter={() => setActive(i)}
                        >
                            {/* Image container with hover overlay */}
                            <div style={{
                                position: "relative",
                                width: "100%", 
                                height: 280,
                                overflow: "hidden",
                                marginBottom: 12,
                                background: "#f5f0e8",
                                borderRadius: 8,
                            }}>
                                <img 
                                    src={item.imageUrl} 
                                    alt={item.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        transition: "opacity 0.3s ease",
                                    }}
                                />
                                {/* Hover overlay with details */}
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(255, 255, 255, 0.95)",
                                    opacity: 0,
                                    transition: "opacity 0.3s ease",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: 20,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    textAlign: "center",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                                onMouseOut={(e) => (e.currentTarget.style.opacity = "0")}
                                >
                                    <span style={{ 
                                        fontSize: "0.7rem", 
                                        fontWeight: 600, 
                                        color: "var(--gold)",
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        marginBottom: 8
                                    }}>
                                        {item.collection}
                                    </span>
                                    <h3 style={{
                                        fontFamily: "var(--font-display)", 
                                        fontWeight: 700,
                                        fontSize: "1.25rem",
                                        color: "var(--charcoal)",
                                        marginBottom: 8,
                                    }}>{item.name}</h3>
                                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
                                        {item.description}
                                    </p>
                                    <div style={{ marginBottom: 20, width: "100%" }}>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: 4 }}>Top</div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--charcoal)" }}>{item.notes.top.join(", ")}</div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginTop: 6, marginBottom: 4 }}>Heart</div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--charcoal)" }}>{item.notes.heart.join(", ")}</div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginTop: 6, marginBottom: 4 }}>Base</div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--charcoal)" }}>{item.notes.base.join(", ")}</div>
                                    </div>
                                    <button className="btn btn-gold" style={{ width: "100%" }}>
                                        Add To Cart
                                    </button>
                                </div>
                            </div>

                            {/* Default content (shown normally) */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3 style={{
                                    fontFamily: "var(--font-display)", 
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    color: "var(--charcoal)",
                                    margin: 0,
                                }}>{item.name}</h3>
                                <span style={{
                                    fontFamily: "var(--font-display)", 
                                    fontWeight: 700, 
                                    fontSize: "1.1rem",
                                    color: "var(--charcoal)",
                                }}>{item.price}</span>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Dots */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
                    {items.map((_, i) => (
                        <button key={i} onClick={() => setActive(i)} style={{
                            width: i === active ? 24 : 8, height: 8, borderRadius: 4,
                            background: i === active ? "var(--gold)" : "var(--border)",
                            border: "none", transition: "all 0.3s", cursor: "pointer", padding: 0,
                        }} aria-label={`Slide ${i + 1}`} />
                    ))}
                </div>
            </div>
            <style>{`
        @media (max-width: 1200px) {
          #collection .container > div:nth-child(2) { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 900px) {
          #collection .container > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #collection .container > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </section>
    );
};

export default Collection;
