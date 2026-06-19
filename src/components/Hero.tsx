import React from "react";
import { HERO } from "../data/siteContent";

const Hero: React.FC = () => {
  return (
    <section id="home" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background Video */}
      <video
        src={`${import.meta.env.BASE_URL}hero_video.mp4`}
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
          animation: "fadeIn 1s ease-in-out",
        }}
      />

      {/* Overlays */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1,
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.2) 100%)",
        zIndex: 2,
      }} />

      {/* Main Content */}
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        zIndex: 10,
        paddingTop: "76px",
      }}>
        {/* Left Content Block - Optimized */}
        <div style={{
          textAlign: "left",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              width: "48px",
              height: "1px",
              background: "var(--gold)",
            }} />
            <span style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "0.85rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}>
              {HERO.smallLabel}
            </span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 6vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#fff",
            marginBottom: "1.75rem",
            whiteSpace: "pre-line",
          }}>
            {HERO.mainHeading}
          </h1>
          <p style={{
            fontSize: "1.05rem",
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.85)",
            marginBottom: "2.75rem",
            maxWidth: "480px",
          }}>
            {HERO.description}
          </p>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
          }}>
            <a 
              href={HERO.ctaPrimary.href}
              className="btn btn-gold"
              style={{
                padding: "1rem 2.5rem",
                fontSize: "0.95rem",
                letterSpacing: "0.08em",
              }}
            >
              {HERO.ctaPrimary.label}
            </a>
            <a 
              href={HERO.ctaSecondary.href}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.75rem",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#fff";
              }}
            >
              {HERO.ctaSecondary.label}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: "transform 0.2s ease" }}>
                <path d="M3.5 9H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10 4.5L14.5 9L10 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          #home .container {
            text-align: center;
          }
          
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
};

export default Hero;
