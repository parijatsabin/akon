import React, { useState } from "react";
import { useSiteData } from "../PublicSite";

const Newsletter: React.FC = () => {
  const { newsletter: NEWSLETTER, brand: BRAND } = useSiteData();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <section id="contact" className="newsletter-section">
      <div className="newsletter-ring" style={{ right: -100, top: -100, width: 340, height: 340 }} />
      <div className="newsletter-ring" style={{ right: -50, top: -50, width: 220, height: 220, opacity: 0.6 }} />
      <div className="newsletter-ring" style={{ left: -60, bottom: -60, width: 240, height: 240, opacity: 0.4 }} />

      <div className="container newsletter-inner">
        <div className="section-label" style={{ justifyContent: "center", marginBottom: 20 }}>
          <span className="section-label-line" />
          <span className="eyebrow">{NEWSLETTER.eyebrow}</span>
          <span className="section-label-line" />
        </div>

        <h2 className="newsletter-title">
          {NEWSLETTER.headline}{" "}<span className="newsletter-brand">{NEWSLETTER.brandHighlight}</span>
        </h2>
        <p className="newsletter-sub">{NEWSLETTER.subtext}</p>

        {submitted ? (
          <div className="newsletter-success">
            ✓ Thank you! You've been subscribed to {BRAND.name}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={NEWSLETTER.placeholder} required
              className="newsletter-input"
            />
            <button type="submit" className="btn btn-gold newsletter-btn" style={{ borderRadius: 0, whiteSpace: "nowrap", padding: "18px 34px", fontSize: "0.82rem" }}>
              {NEWSLETTER.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
