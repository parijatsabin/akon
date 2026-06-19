import React, { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "../data/siteContent";

// Avatar placeholder
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2);
  return (
    <div style={{
      width: 56, height: 56, borderRadius: "50%",
      background: "linear-gradient(135deg, var(--gold-light), var(--gold-dark))",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#fff",
      flexShrink: 0,
    }}>{initials}</div>
  );
};

const Testimonials: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const items = TESTIMONIALS.items;
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);
  const t = items[idx];

  return (
    <section id="reviews" className="section" style={{ background: "var(--warm-white)" }}>
      <div className="container" style={{ maxWidth: 850, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "var(--charcoal)", marginBottom: 48 }}>
          {TESTIMONIALS.headline}
        </h2>

        <div style={{
          background: "var(--section-bg)", borderRadius: 20,
          padding: "56px 48px", position: "relative",
          boxShadow: "var(--shadow-lg)",
        }}>
          {/* Quote mark */}
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "6rem",
            color: "var(--gold)", opacity: 0.2, lineHeight: 1,
            position: "absolute", top: 16, left: 32, userSelect: "none",
          }}>"</div>

          {/* Stars */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 24 }}>
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} size={20} fill="var(--gold)" color="var(--gold)" />
            ))}
          </div>

          {/* Quote */}
          <p style={{
            fontFamily: "var(--font-display)", fontStyle: "italic",
            fontSize: "clamp(1.2rem, 2vw, 1.5rem)", lineHeight: 1.7,
            color: "var(--text-main)", marginBottom: 36, maxWidth: 620, margin: "0 auto 36px",
          }}>"{t.quote}"</p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Avatar name={t.author} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, color: "var(--charcoal)", fontSize: "1.1rem" }}>{t.author}</div>
              <div style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>{t.title}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 36 }}>
          <button onClick={prev} className="btn btn-outline" style={{ padding: "8px 12px", borderRadius: "50%" }} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} style={{
                width: i === idx ? 24 : 8, height: 8, borderRadius: 4, padding: 0,
                background: i === idx ? "var(--gold)" : "var(--border)",
                border: "none", transition: "all 0.3s", cursor: "pointer",
              }} aria-label={`Review ${i + 1}`} />
            ))}
          </div>
          <button onClick={next} className="btn btn-gold" style={{ padding: "8px 12px", borderRadius: "50%" }} aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;