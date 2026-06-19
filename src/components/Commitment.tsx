import React from "react";
import { COMMITMENT } from "../data/siteContent";

const CommitmentBottle: React.FC = () => (
  <svg viewBox="0 0 160 280" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: 140, filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.2))", animation: "floatY 7s ease-in-out infinite" }}>
    <rect x="60" y="0" width="40" height="20" rx="6" fill="#1c1c1c" />
    <rect x="68" y="20" width="24" height="26" rx="3" fill="#c9992c" />
    <rect x="48" y="44" width="64" height="12" rx="4" fill="#a07820" />
    <rect x="24" y="56" width="112" height="196" rx="18" fill="url(#commitGrad)" />
    <rect x="38" y="70" width="18" height="110" rx="9" fill="rgba(255,255,255,0.2)" />
    <rect x="42" y="108" width="76" height="92" rx="8" fill="rgba(255,255,255,0.9)" />
    <text x="80" y="150" textAnchor="middle" fontFamily="Playfair Display,serif" fontSize="16" fontWeight="700" fill="#1c1c1c">FRANCE</text>
    <text x="80" y="172" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="9" fill="#7a7262" letterSpacing="2">PURE ESSENCE</text>
    <defs>
      <linearGradient id="commitGrad" x1="24" y1="56" x2="136" y2="252" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f0d080" />
        <stop offset="0.5" stopColor="#c9992c" />
        <stop offset="1" stopColor="#6a4810" />
      </linearGradient>
    </defs>
  </svg>
);

const Commitment: React.FC = () => (
  <section className="section" style={{ background: "var(--section-bg)" }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CommitmentBottle />
      </div>
      <div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 3.8vw, 3.2rem)",
          fontWeight: 700, lineHeight: 1.1,
          color: "var(--charcoal)", marginBottom: 24,
        }}>{COMMITMENT.headline}</h2>
        <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 36 }}>
          {COMMITMENT.body}
        </p>
        <a href={COMMITMENT.cta.href} className="btn btn-dark">{COMMITMENT.cta.label}</a>
      </div>
    </div>
    <style>{`
      @media (max-width: 768px) {
        .commit-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </section>
);

export default Commitment;