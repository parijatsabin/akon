import React from "react";
import { useSiteData } from "../PublicSite";

const CommitmentBottle: React.FC = () => (
  <svg viewBox="0 0 160 280" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 145, filter: "drop-shadow(0 20px 40px rgba(162,127,63,0.30))", animation: "floatY 7s ease-in-out infinite" }}
  >
    <rect x="60" y="0" width="40" height="20" rx="6" fill="var(--charcoal)" />
    <rect x="68" y="20" width="24" height="26" rx="3" fill="var(--gold)" />
    <rect x="48" y="44" width="64" height="12" rx="4" fill="var(--gold-dim)" />
    <rect x="24" y="56" width="112" height="196" rx="18" fill="url(#bottleGrad)" />
    <rect x="38" y="70" width="18" height="110" rx="9" fill="rgba(255,255,255,0.18)" />
    <rect x="42" y="108" width="76" height="92" rx="8" fill="rgba(255,255,255,0.92)" />
    <text x="80" y="148" textAnchor="middle" fontFamily="Playfair Display,serif" fontSize="15" fontWeight="700" fill="var(--charcoal)">ANOK</text>
    <text x="80" y="170" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="8" fill="var(--text-muted)" letterSpacing="2.5">PURE ESSENCE</text>
    <line x1="56" y1="180" x2="104" y2="180" stroke="var(--gold)" strokeWidth="1" opacity="0.5" />
    <defs>
      <linearGradient id="bottleGrad" x1="24" y1="56" x2="136" y2="252" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e8c97a" />
        <stop offset="0.45" stopColor="#a27f3f" />
        <stop offset="1" stopColor="#5a3e18" />
      </linearGradient>
    </defs>
  </svg>
);

const Commitment: React.FC = () => {
  const { commitment: COMMITMENT } = useSiteData();

  return (
    <section className="section" style={{ background: "var(--parchment)" }}>
      <div
        className="container commit-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 88, alignItems: "center" }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "32px 0" }}>
          <CommitmentBottle />
        </div>
        <div>
          <span className="tag">Our Promise</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.6vw, 3rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 24 }}>
            {COMMITMENT.headline}
          </h2>
          <p style={{ fontSize: "1.08rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: 38 }}>
            {COMMITMENT.body}
          </p>
          <a href={COMMITMENT.cta.href} className="btn btn-dark">{COMMITMENT.cta.label}</a>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .commit-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
};

export default Commitment;
