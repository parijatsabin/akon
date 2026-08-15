import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";


const Hero: React.FC = () => {
  const { hero: HERO } = useSiteData();

  return (
    <section id="home" className="hero-section">
      {/* Video wins when set; otherwise a still. Either can be swapped from the CMS. */}
      {HERO.videoUrl ? (
        <video
          src={HERO.videoUrl}
          autoPlay muted loop playsInline preload="auto"
          className="hero-media"
        />
      ) : HERO.backgroundImage ? (
        <img src={HERO.backgroundImage} alt="" aria-hidden="true" className="hero-media" />
      ) : null}
      <div className="hero-overlay-dark" />
      <div className="hero-overlay-radial" />
      <div className="hero-overlay-bottom" />

      {/* Main content */}
      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-label-pill">
            <span className="hero-eyebrow">{HERO.smallLabel}</span>
            <span className="hero-badge">{HERO.smallLabelHighlight}</span>
          </div>
          <h1 className="hero-title">{HERO.mainHeading}</h1>
          <div className="hero-rule" />
          <p className="hero-desc">{HERO.description}</p>
          <div className="hero-ctas">
            <a href={HERO.ctaPrimary.href} className="btn btn-accent" style={{ padding: "0.95rem 2.6rem", minWidth: 175, justifyContent: "center" }}>
              {HERO.ctaPrimary.label}
            </a>
            <Link to={HERO.ctaSecondary.href} className="btn-hero-ghost">
              {HERO.ctaSecondary.label}
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3.5 9H14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M10 4.5L14.5 9L10 13.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
