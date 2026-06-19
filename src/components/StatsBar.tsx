import React from "react";
import { STATS } from "../data/siteContent";

const StatsBar: React.FC = () => (
  <section style={{ background: "var(--charcoal)", padding: "36px 0" }}>
    <div className="container" style={{
      display: "grid",
      gridTemplateColumns: `repeat(${STATS.length}, 1fr)`,
      gap: 12,
    }}>
      {STATS.map((stat, i) => (
        <div key={i} style={{
          textAlign: "center",
          padding: "16px 0",
          borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none",
        }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
            fontWeight: 700,
            color: "var(--gold-light)",
          }}>{stat.value}</div>
          <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.7)", marginTop: 6, letterSpacing: "0.03em" }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
    <style>{`
      @media (max-width: 600px) {
        #stats-grid { grid-template-columns: 1fr 1fr !important; }
      }
    `}</style>
  </section>
);

export default StatsBar;