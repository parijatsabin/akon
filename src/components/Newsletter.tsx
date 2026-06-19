import React, { useState } from "react";
import { NEWSLETTER, BRAND } from "../data/siteContent";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) { setSubmitted(true); setEmail(""); }
  };

  return (
    <section id="contact" style={{
      background: "var(--charcoal)",
      padding: "72px 0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", right: "-80px", top: "-80px", width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(201,153,44,0.2)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "-40px", bottom: "-40px", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(201,153,44,0.1)", pointerEvents: "none" }} />

      <div className="container" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", position: "relative" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 3.2vw, 2.8rem)",
          fontWeight: 700, color: "#fff", marginBottom: 14,
        }}>
          {NEWSLETTER.headline}{" "}
          <span style={{ color: "var(--gold-light)" }}>{NEWSLETTER.brandHighlight}</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 36, lineHeight: 1.75, fontSize: "1.1rem" }}>
          {NEWSLETTER.subtext}
        </p>

        {submitted ? (
          <div style={{
            background: "rgba(201,153,44,0.15)", border: "1px solid var(--gold)",
            borderRadius: 12, padding: "24px 40px", color: "var(--gold-light)",
            fontWeight: 600, fontSize: "1.1rem",
          }}>
            ✓ Thank you! You've been subscribed to {BRAND.name}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 0, maxWidth: 560, margin: "0 auto", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={NEWSLETTER.placeholder}
              required
              style={{
                flex: 1, padding: "18px 24px",
                border: "none", outline: "none",
                fontFamily: "var(--font-body)", fontSize: "1.05rem",
                background: "rgba(255,255,255,0.06)", color: "#fff",
                borderRight: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <button type="submit" className="btn btn-gold" style={{ borderRadius: 0, whiteSpace: "nowrap", padding: "18px 32px" }}>
              {NEWSLETTER.cta}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;