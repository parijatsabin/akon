import React from "react";
import { HERO } from "../data/siteContent";

const Hero: React.FC = () => (
  <section
    id="home"
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Background Video */}
    <video
      src="https://videos.pexels.com/video-files/33233525/14160278_3840_2160_25fps.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        zIndex: 0,
        animation: "fadeIn 1.2s ease-in-out",
      }}
    />

    {/* Base dark overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(13, 12, 11, 0.50)",
        zIndex: 1,
      }}
    />
    {/* Directional gradient — stronger left, fades right */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(95deg, rgba(13,12,11,0.82) 0%, rgba(13,12,11,0.38) 55%, rgba(13,12,11,0.10) 100%)",
        zIndex: 2,
      }}
    />
    {/* Subtle gold shimmer at bottom */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "35%",
        background:
          "linear-gradient(to top, rgba(162,127,63,0.08) 0%, transparent 100%)",
        zIndex: 3,
      }}
    />

    {/* Main content */}
    <div
      className="container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        zIndex: 40,
        paddingTop: "80px",
      }}
    >
      <div style={{ textAlign: "left", maxWidth: 560 }}>

        {/* Label pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.6rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.78rem",
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.78)",
            }}
          >
            {HERO.smallLabel}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#fff",
              background: "var(--gold)",
              padding: "5px 16px",
              borderRadius: "4px",
              boxShadow: "0 2px 12px rgba(162,127,63,0.40)",
            }}
          >
            {HERO.smallLabelHighlight}
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 5.5vw, 5.2rem)",
            fontWeight: 700,
            lineHeight: 1.04,
            color: "#fff",
            marginBottom: "1.8rem",
            whiteSpace: "pre-line",
          }}
        >
          {HERO.mainHeading}
        </h1>

        {/* Gold accent rule */}
        <div
          style={{
            width: 56,
            height: 2,
            background: "var(--gold)",
            borderRadius: 2,
            marginBottom: "1.8rem",
            opacity: 0.85,
          }}
        />

        {/* Description */}
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.80)",
            marginBottom: "3rem",
          }}
        >
          {HERO.description}
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.6rem", flexWrap: "wrap" }}>
          <a
            href={HERO.ctaPrimary.href}
            className="btn btn-gold"
            style={{ padding: "1.05rem 2.6rem", fontSize: "0.88rem" }}
          >
            {HERO.ctaPrimary.label}
          </a>
          <a
            href={HERO.ctaSecondary.href}
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "0.88rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.85)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.65rem",
              transition: "color 0.22s ease",
              borderBottom: "1px solid rgba(255,255,255,0.30)",
              paddingBottom: "2px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--gold-light)";
              e.currentTarget.style.borderBottomColor = "var(--gold-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
              e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.30)";
            }}
          >
            {HERO.ctaSecondary.label}
            <svg
              width="16" height="16"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.5 9H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M10 4.5L14.5 9L10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        #home .container { justify-content: center; }
        #home .container > div {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      }
    `}</style>
  </section>
);

export default Hero;
