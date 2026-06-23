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
    <section id="contact" style={{ background: "var(--charcoal)", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      {/* Decorative rings */}
      <div style={{ position: "absolute", right: "-100px", top: "-100px", width: 340, height: 340, borderRadius: "50%", border: "1px solid var(--gold-rule)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: "-50px", top: "-50px", width: 220, height: 220, borderRadius: "50%", border: "1px solid var(--gold-rule)", pointerEvents: "none", opacity: 0.6 }} />
      <div style={{ position: "absolute", left: "-60px", bottom: "-60px", width: 240, height: 240, borderRadius: "50%", border: "1px solid var(--gold-rule)", pointerEvents: "none", opacity: 0.4 }} />

      <div className="container" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto", position: "relative" }}>
        {/* Eyebrow */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 32, height: 1, background: "var(--gold)", opacity: 0.5 }} />
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)" }}>Exclusive Access</span>
          <div style={{ width: 32, height: 1, background: "var(--gold)", opacity: 0.5 }} />
        </div>

        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 3.2vw, 2.8rem)", fontWeight: 700, color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>
          {NEWSLETTER.headline}{" "}<span style={{ color: "var(--gold-light)" }}>{NEWSLETTER.brandHighlight}</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.58)", marginBottom: 40, lineHeight: 1.8, fontSize: "1rem", maxWidth: 520, margin: "0 auto 40px" }}>
          {NEWSLETTER.subtext}
        </p>

        {submitted ? (
          <div style={{ background: "var(--gold-glow)", border: "1px solid var(--gold-rule)", borderRadius: "var(--radius)", padding: "26px 44px", color: "var(--gold-light)", fontWeight: 600, fontSize: "1.05rem" }}>
            ✓ Thank you! You've been subscribed to {BRAND.name}.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="newsletter-form"
            style={{ display: "flex", gap: 0, maxWidth: 540, margin: "0 auto", borderRadius: "var(--radius-sm)", overflow: "hidden", boxShadow: "0 6px 30px rgba(0,0,0,0.35)" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={NEWSLETTER.placeholder}
              required
              style={{ flex: 1, padding: "18px 24px", border: "none", outline: "none", fontFamily: "var(--font-body)", fontSize: "0.95rem", background: "rgba(255,255,255,0.07)", color: "#fff", borderRight: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button
              type="submit"
              className="btn btn-gold newsletter-btn"
              style={{ borderRadius: 0, whiteSpace: "nowrap", padding: "18px 34px", fontSize: "0.82rem" }}
            >
              {NEWSLETTER.cta}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @media (max-width: 540px) {
          .newsletter-form {
            flex-direction: column !important;
            border-radius: var(--radius-sm) !important;
            overflow: visible !important;
            box-shadow: none !important;
            gap: 10px !important;
          }
          .newsletter-form input {
            border-radius: var(--radius-sm) !important;
            border-right: none !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.30) !important;
          }
          .newsletter-btn {
            border-radius: var(--radius-sm) !important;
            width: 100% !important;
            justify-content: center !important;
            box-shadow: 0 4px 20px rgba(162,127,63,0.30) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Newsletter;
