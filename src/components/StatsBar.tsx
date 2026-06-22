import React from "react";
import { useSiteData } from "../PublicSite";

const StatsBar: React.FC = () => {
  const { stats: STATS } = useSiteData();

  return (
    <section
      style={{
        background: "var(--charcoal)",
        padding: "40px 0",
        borderTop: "1px solid rgba(162,127,63,0.18)",
        borderBottom: "1px solid rgba(162,127,63,0.18)",
      }}
    >
      <div
        className="container"
        style={{ display: "grid", gridTemplateColumns: `repeat(${STATS.length}, 1fr)`, gap: 0 }}
      >
        {STATS.map((stat, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "20px 16px",
              borderRight: i < STATS.length - 1 ? "1px solid var(--border-dark)" : "none",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 700, color: "var(--gold-light)", letterSpacing: "0.02em", lineHeight: 1.1 }}>
              {stat.value}
            </div>
            <div style={{ width: 28, height: 1.5, background: "var(--gold)", borderRadius: 2, margin: "10px auto", opacity: 0.55 }} />
            <div style={{ fontSize: "0.80rem", fontWeight: 500, letterSpacing: "0.10em", textTransform: "uppercase", color: "rgba(255,255,255,0.60)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .stats-bar-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default StatsBar;
