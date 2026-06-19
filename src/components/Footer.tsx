import React from "react";
import { FOOTER, BRAND } from "../data/siteContent";

const PinterestIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const IGIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const FBIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SocialBtn: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    style={{
      width: 34, height: 34,
      borderRadius: "50%",
      border: "1px solid #c9bfb8",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#6a5a52",
      transition: "all 0.2s",
      flexShrink: 0,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "#1e1209";
      e.currentTarget.style.borderColor = "#1e1209";
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderColor = "#c9bfb8";
      e.currentTarget.style.color = "#6a5a52";
    }}
  >
    {children}
  </a>
);

const Footer: React.FC = () => (
  <footer style={{ background: "#f5f0eb", borderTop: "1px solid #e4dbd4" }}>
    <div className="container">

      {/* ── Main row: brand left | nav right ── */}
      <div className="footer-main" style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 48,
        padding: "64px 0 52px",
      }}>

        {/* ── Brand column ── */}
        <div style={{ flexShrink: 0, maxWidth: 280 }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.6rem",
            letterSpacing: "0.18em",
            color: "#1e1209",
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            {BRAND.name}
          </div>

          <p style={{
            fontSize: "0.85rem",
            color: "#8a7a72",
            lineHeight: 1.8,
            marginBottom: 28,
          }}>
            {FOOTER.tagline}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <SocialBtn href={BRAND.socialLinks.instagram} label="Instagram"><IGIcon /></SocialBtn>
            <SocialBtn href={BRAND.socialLinks.facebook} label="Facebook"><FBIcon /></SocialBtn>
            <SocialBtn href={BRAND.socialLinks.pinterest} label="Pinterest"><PinterestIcon /></SocialBtn>
          </div>
        </div>


        {/* ── Nav columns ── */}
        <div className="footer-nav" style={{
          display: "flex",
          gap: 48,
          justifyContent: "flex-end",
          flex: 1,
        }}>
          {FOOTER.navColumns.map((col) => (
            <div key={col.heading} style={{ minWidth: 120, textAlign: "center" }}>
              <h4 style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "0.72rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#1e1209",
                marginBottom: 22,
                whiteSpace: "nowrap",
              }}>
                {col.heading}
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 13, alignItems: "center" }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: "0.85rem",
                        color: "#8a7a72",
                        transition: "color 0.18s",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "#1e1209")}
                      onMouseLeave={e => (e.currentTarget.style.color = "#8a7a72")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop: "1px solid #ddd5ce",
        padding: "18px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <p style={{ fontSize: "0.82rem", color: "#9a8a82" }}>
          {FOOTER.copyright}
        </p>
        <p style={{ fontSize: "0.82rem", color: "#9a8a82" }}>
          Designed By{" "}
          <a
            href={FOOTER.credit.href}
            style={{ color: "#9e5c3a", fontWeight: 600 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.72")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {FOOTER.credit.label}
          </a>
        </p>
      </div>
    </div>

    <style>{`
      @media (max-width: 1080px) {
        .footer-main { flex-wrap: wrap !important; }
        .footer-divider { display: none !important; }
        .footer-main > div:first-child { max-width: 100% !important; width: 100%; padding-bottom: 36px; border-bottom: 1px solid #ddd5ce; }
        .footer-nav { justify-content: flex-start !important; flex-wrap: wrap; gap: 32px !important; }
      }
      @media (max-width: 480px) {
        .footer-nav { gap: 24px !important; }
        .footer-nav > div { min-width: calc(50% - 12px) !important; }
      }
    `}</style>
  </footer>
);

export default Footer;
