import React from "react";
import { ABOUT, WHY_CHOOSE_US, BRAND } from "../data/siteContent";

const ICONS: Record<string, React.ReactNode> = {
  "01": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  "02": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "03": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
  "04": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const About: React.FC = () => (
  <section id="about" className="section" style={{ background: "var(--warm-white)" }}>
    <div className="container">

      {/* ── Two-column about block ── */}
      <div
        className="about-top"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "center",
          marginBottom: 88,
        }}
      >
        {/* Left — text */}
        <div>
          <span className="tag">{ABOUT.sectionLabel}</span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "var(--text-main)",
              marginBottom: 22,
            }}
          >
            {ABOUT.headline}
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: 36,
              maxWidth: 460,
            }}
          >
            {ABOUT.body}
          </p>
          <a href={ABOUT.cta.href} className="btn btn-dark">
            {ABOUT.cta.label}
          </a>
        </div>

        {/* Right — brand statement card */}
        <div
          style={{
            background: "var(--parchment)",
            borderRadius: "var(--radius-lg)",
            padding: "52px 44px",
            position: "relative",
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}
        >
          {/* Decorative oversized quote */}
          <div
            style={{
              position: "absolute",
              top: 8, right: 24,
              fontFamily: "var(--font-display)",
              fontSize: "9rem",
              lineHeight: 1,
              color: "var(--gold)",
              opacity: 0.07,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            "
          </div>

          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1.05rem, 1.7vw, 1.3rem)",
              lineHeight: 1.8,
              color: "var(--text-main)",
              marginBottom: 28,
            }}
          >
            "Crafted for those who understand that a fragrance is not just a
            scent — it is a memory, an identity, a quiet statement of who you
            are."
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="gold-rule" />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              {BRAND.name} — {BRAND.tagline.split(" ").slice(0, 4).join(" ")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: "var(--border)",
          marginBottom: 72,
        }}
      />

      {/* ── Why Choose Us ── */}
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
            fontWeight: 700,
            color: "var(--text-main)",
            marginBottom: 10,
          }}
        >
          {WHY_CHOOSE_US.headline}
        </h3>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--gold)",
            fontStyle: "italic",
            fontWeight: 500,
          }}
        >
          {WHY_CHOOSE_US.tagline}
        </p>
      </div>

      {/* Reason cards */}
      <div
        className="reasons-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
        }}
      >
        {WHY_CHOOSE_US.reasons.map((r) => (
          <div
            key={r.id}
            style={{
              padding: "34px 28px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              transition: "box-shadow 0.28s, transform 0.28s, border-color 0.28s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(-6px)";
              el.style.boxShadow = "var(--shadow-gold)";
              el.style.borderColor = "var(--gold-subtle)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(0)";
              el.style.boxShadow = "none";
              el.style.borderColor = "var(--border)";
            }}
          >
            {/* Icon container */}
            <div
              style={{
                width: 46, height: 46,
                borderRadius: "var(--radius-sm)",
                background: "var(--parchment)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              {ICONS[r.id]}
            </div>

            {/* Number */}
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "var(--gold-subtle)",
              }}
            >
              {r.id}
            </div>

            {/* Title */}
            <h4
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.05rem",
                color: "var(--text-main)",
                lineHeight: 1.2,
              }}
            >
              {r.title}
            </h4>

            {/* Body */}
            <p
              style={{
                fontSize: "0.87rem",
                color: "var(--text-muted)",
                lineHeight: 1.75,
              }}
            >
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .about-top { grid-template-columns: 1fr !important; gap: 44px !important; }
        .reasons-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 480px) {
        .reasons-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </section>
);

export default About;
