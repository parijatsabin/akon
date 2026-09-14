import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";


const Hero: React.FC = () => {
  const { hero: HERO } = useSiteData();

  return (
    <section id="home" className="hero-section">
      {/* The backdrop is a still, uploaded from the CMS; blank means no image. */}
      {HERO.backgroundImage && (
        <img src={HERO.backgroundImage} alt="" aria-hidden="true" className="hero-media" />
      )}
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
            {/* Fixed anchor, not HERO.ctaPrimary.href. The signature product
                is the next section of this same page, so the primary CTA
                scrolls to it rather than routing away to /fragrance — which
                sent the visitor past the buy column to the reference material.
                html carries scroll-behavior: smooth and scroll-padding-top, so
                a plain anchor lands correctly under the fixed navbar and stays
                keyboard- and right-click-friendly. The label remains editable. */}
            <a href="#signature" className="btn btn-accent" style={{ padding: "0.95rem 2.6rem", minWidth: 175, justifyContent: "center" }}>
              {HERO.ctaPrimary.label}
            </a>
            {/* No trailing arrow. The two hero buttons are siblings in one
                group; an arrow on only the secondary one made the weaker
                action look like the one that leads somewhere. Weight and fill
                already carry the primary/secondary distinction. */}
            <Link to={HERO.ctaSecondary.href} className="btn-hero-ghost">
              {HERO.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
