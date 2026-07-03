import React from "react";
import { useSiteData } from "../PublicSite";

const Hero: React.FC = () => {
  const { hero: HERO } = useSiteData();

  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Video */}
      <video
        src="https://videos.pexels.com/video-files/33233525/14160278_3840_2160_25fps.mp4"
        autoPlay muted loop playsInline preload="auto"
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover", zIndex: 0,
          animation: "heroFadeIn 1.4s ease-in-out",
        }}
      />

      {/* Dark base overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,9,8,0.62)", zIndex: 1 }} />
      {/* Gradient: slightly lighter in the center column for the text */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 52%, rgba(0,0,0,0.0) 0%, rgba(10,9,8,0.45) 100%)", zIndex: 2 }} />
      {/* Bottom gold bleed */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(to top, rgba(162,127,63,0.07) 0%, transparent 100%)", zIndex: 3 }} />

      {/* Content — centered */}
      <div
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 40,
          paddingTop: 96,
          maxWidth: 780,
          margin: "0 auto",
        }}
      >
        {/* Label pill */}
        <div
          className="hero-label"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "2rem",
          }}
        >
          <span style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "0.80rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.72)",
          }}>
            {HERO.smallLabel}
          </span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "0.78rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#fff",
            background: "var(--gold)",
            padding: "5px 16px",
            borderRadius: "4px",
            boxShadow: "0 2px 16px rgba(162,127,63,0.45)",
          }}>
            {HERO.smallLabelHighlight}
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.6rem, 5vw, 4.6rem)",
          fontWeight: 700,
          lineHeight: 1.10,
          color: "#fff",
          marginBottom: "1.6rem",
          whiteSpace: "pre-line",
          letterSpacing: "-0.01em",
        }}>
          {HERO.mainHeading}
        </h1>

        {/* Gold rule — centered */}
        <div style={{
          width: 56,
          height: 2,
          background: "var(--gold)",
          borderRadius: 2,
          marginBottom: "1.8rem",
          opacity: 0.90,
        }} />

        {/* Description */}
        <p style={{
          fontSize: "1.05rem",
          lineHeight: 1.85,
          color: "rgba(255,255,255,0.72)",
          marginBottom: "3rem",
          maxWidth: 560,
        }}>
          {HERO.description}
        </p>

        {/* CTAs */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.2rem",
          flexWrap: "wrap",
        }}>
          <a
            href={HERO.ctaPrimary.href}
            className="btn btn-gold"
            style={{ padding: "1.05rem 2.8rem", fontSize: "0.88rem", minWidth: 180, justifyContent: "center" }}
          >
            {HERO.ctaPrimary.label}
          </a>
          <a
            href={HERO.ctaSecondary.href}
            className="btn-hero-ghost"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.88rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.88)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "1.05rem 2.4rem",
              minWidth: 180,
              justifyContent: "center",
              border: "1.5px solid rgba(255,255,255,0.35)",
              borderRadius: "var(--radius-sm)",
              transition: "all 0.26s ease",
              backdropFilter: "blur(4px)",
              background: "rgba(255,255,255,0.05)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "#fff";
              el.style.borderColor = "var(--gold)";
              el.style.background = "rgba(162,127,63,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "rgba(255,255,255,0.88)";
              el.style.borderColor = "rgba(255,255,255,0.35)";
              el.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            {HERO.ctaSecondary.label}
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9H14.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M10 4.5L14.5 9L10 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes heroFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .hero-label { animation: heroFadeIn 0.8s ease-in-out; }
        @media (max-width: 600px) {
          #home .container { padding-left: 20px !important; padding-right: 20px !important; }
          #home .btn-hero-ghost, #home .btn-gold { min-width: 140px !important; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
