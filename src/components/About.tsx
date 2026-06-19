import React from "react";
import { ABOUT } from "../data/siteContent";

// Decorative hand + bottle SVG
const AboutVisual: React.FC = () => (
  <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", height: 320 }}>
    {/* Background circle */}
    <div style={{
      position: "absolute", left: "50%", bottom: 0,
      transform: "translateX(-50%)",
      width: 280, height: 280, borderRadius: "50%",
      background: "radial-gradient(circle, #e8c87a33 0%, transparent 70%)",
    }} />
    {/* Small bottle SVG */}
    <svg viewBox="0 0 140 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 130, filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.2))", animation: "floatY 6s ease-in-out infinite" }}>
      <rect x="52" y="0" width="36" height="18" rx="5" fill="#1c1c1c" />
      <rect x="58" y="18" width="24" height="20" rx="3" fill="#c9992c" />
      <rect x="44" y="36" width="52" height="10" rx="3" fill="#a07820" />
      <rect x="24" y="46" width="92" height="148" rx="14" fill="url(#aboutBottleGrad)" />
      <rect x="34" y="56" width="14" height="80" rx="7" fill="rgba(255,255,255,0.18)" />
      <rect x="36" y="86" width="68" height="68" rx="6" fill="rgba(255,255,255,0.9)" />
      <text x="70" y="115" textAnchor="middle" fontFamily="Playfair Display,serif" fontSize="13" fontWeight="700" fill="#1c1c1c">LUXE</text>
      <text x="70" y="133" textAnchor="middle" fontFamily="Jost,sans-serif" fontSize="7" fill="#7a7262" letterSpacing="2">PARFUM</text>
      <defs>
        <linearGradient id="aboutBottleGrad" x1="24" y1="46" x2="116" y2="194" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e8c87a" />
          <stop offset="0.5" stopColor="#c9992c" />
          <stop offset="1" stopColor="#7a5a10" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const About: React.FC = () => (
  <section id="about" className="section" style={{ background: "var(--section-bg)" }}>
    <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
      <AboutVisual />
      <div>
        <span className="tag">{ABOUT.sectionLabel}</span>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.3rem, 4vw, 3.4rem)",
          fontWeight: 700, lineHeight: 1.1,
          color: "var(--charcoal)", marginBottom: 24,
        }}>{ABOUT.headline}</h2>
        <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 36 }}>
          {ABOUT.body}
        </p>
        <a href={ABOUT.cta.href} className="btn btn-dark">{ABOUT.cta.label}</a>
      </div>
    </div>
    <style>{`
      @media (max-width: 768px) {
        #about .container { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </section>
);

export default About;