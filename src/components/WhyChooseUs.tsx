import React from "react";
import { WHY_CHOOSE_US } from "../data/siteContent";

// Mini gallery placeholder tiles
const GalleryMosaic: React.FC = () => {
  const colors = ["#e8c87a33", "#c9992c22", "#1c1c1c11", "#f9d9d944"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {colors.map((c, i) => (
        <div key={i} style={{
          height: i === 0 ? 180 : 130, borderRadius: 12,
          background: c, border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <svg viewBox="0 0 80 80" width={48} opacity={0.4}>
            <rect x="28" y="0" width="24" height="10" rx="3" fill="#c9992c" />
            <rect x="16" y="16" width="48" height="64" rx="9" fill="#c9992c" />
          </svg>
        </div>
      ))}
    </div>
  );
};

const WhyChooseUs: React.FC = () => (
  <section className="section" style={{ background: "var(--section-bg)" }}>
    <div className="container">
      <div style={{ marginBottom: 56, maxWidth: 540 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "var(--charcoal)", marginBottom: 12 }}>
          {WHY_CHOOSE_US.headline}
        </h2>
        <p style={{ color: "var(--gold)", fontWeight: 600, fontSize: "1.1rem", fontStyle: "italic" }}>{WHY_CHOOSE_US.tagline}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <GalleryMosaic />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {WHY_CHOOSE_US.reasons.map((r) => (
            <div key={r.id} style={{
              background: "var(--warm-white)", borderRadius: 14,
              padding: "28px 24px", boxShadow: "var(--shadow)",
              borderTop: "3px solid var(--gold)",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 700,
                fontSize: "1.8rem", color: "var(--gold)", marginBottom: 10,
              }}>{r.id}</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.15rem", color: "var(--charcoal)", marginBottom: 10 }}>
                {r.title}
              </h3>
              <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <style>{`
      @media (max-width: 768px) {
        .why-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </section>
);

export default WhyChooseUs;