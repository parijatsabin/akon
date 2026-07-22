import React from "react";
import { useSiteData } from "../PublicSite";

const ICONS: Record<string, React.ReactNode> = {
  "01": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
  "02": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  "03": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>,
  "04": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
};

const About: React.FC = () => {
  const { about, brand: BRAND } = useSiteData();

  return (
    <section id="about" className="section bg-white">
      <div className="container">

        <div className="about-top">
          {/* Left */}
          <div className="about-text">
            <span className="tag">{about.sectionLabel}</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,4vw,3.2rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 22 }}>
              {about.headline}
            </h2>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 36, maxWidth: 460 }}>
              {about.body}
            </p>
            <a href={about.cta.href} className="btn btn-dark">{about.cta.label}</a>
          </div>

          {/* Right — quote card */}
          <div className="about-quote-card">
            <div className="about-quote-bg">"</div>
            <p className="about-quote-text">
              "{about.brandQuote}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="gold-rule" />
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--gold)" }}>
                {BRAND.name} — {BRAND.tagline.split(" ").slice(0, 4).join(" ")}
              </span>
            </div>
          </div>
        </div>

        <div className="about-divider" />

        {/* Why choose us */}
        <div className="section-header">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,2.8vw,2.2rem)", fontWeight: 700, color: "var(--text-main)", marginBottom: 10 }}>
            {about.whyHeadline}
          </h3>
          <p style={{ fontSize: "0.95rem", color: "var(--gold)", fontStyle: "italic", fontWeight: 500 }}>
            {about.whyTagline}
          </p>
        </div>

        <div className="reasons-grid">
          {about.reasons.map((r) => (
            <div key={r.id} className="reason-card">
              <div className="reason-icon">
                {ICONS[r.id] ?? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /></svg>}
              </div>
              <div className="reason-num">{r.id}</div>
              <h4 className="reason-title">{r.title}</h4>
              <p className="reason-body">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
