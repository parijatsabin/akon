import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import { parseHeroVideo } from "../lib/videoUrl";
import { useYouTubePlaying } from "../hooks/useYouTubePlaying";


const Hero: React.FC = () => {
  const { hero: HERO } = useSiteData();
  /* The CMS field takes either a direct file URL or a YouTube link; each needs a
     different element, so the shape is resolved here rather than in the markup. */
  const video = parseHeroVideo(HERO.videoUrl);
  /* Held back until the player is past its own poster and centre play button. */
  const [frameRef, videoPlaying] = useYouTubePlaying(video?.kind === "youtube");

  return (
    <section id="home" className="hero-section">
      {/* Video wins when set; otherwise a still. Either can be swapped from the CMS. */}
      {video?.kind === "youtube" ? (
        /* An iframe can't be object-fit: cover, so the wrapper clips and the
           frame is over-sized to whichever axis is short — same filled backdrop
           the <video> gives. It stays inert: the hero content sits above it,
           and with no pointer events the player chrome is never summoned. */
        <>
          {HERO.backgroundImage && (
            <img src={HERO.backgroundImage} alt="" aria-hidden="true" className="hero-media hero-media-poster" />
          )}
          <div className={`hero-media hero-media-frame${videoPlaying ? " is-playing" : ""}`} aria-hidden="true">
            <iframe
              ref={frameRef}
              src={video.embedUrl}
              title=""
              tabIndex={-1}
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={false}
            />
          </div>
        </>
      ) : video ? (
        /* poster carries the still through the first frames, so the hero is
           never a black rectangle while the file buffers. */
        <video
          src={video.src}
          poster={HERO.backgroundImage || undefined}
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
