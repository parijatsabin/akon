import React from "react";
import { useSiteData } from "../PublicSite";

const PinterestIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
const IGIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const FBIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const SocialBtn: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.22s", flexShrink: 0 }}
    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--gold)"; e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    {children}
  </a>
);


// Helper function to convert 24-hour time to 12-hour format
const format12HourTime = (time: string) => {
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

const Footer: React.FC = () => {
  const { footer: FOOTER, brand: BRAND } = useSiteData();
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--parchment-mid)", borderTop: "1px solid var(--border)" }}>
      <div className="container">

        {/* Main row */}
        <div className="footer-main" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 52, padding: "68px 0 56px" }}>

          {/* Brand column */}
          <div className="footer-brand" style={{ flexShrink: 0, maxWidth: 290 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.55rem", letterSpacing: "0.20em", color: "var(--gold)", textTransform: "uppercase", marginBottom: 18 }}>
              {BRAND.name}
            </div>
            <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: 28 }}>
              {FOOTER.tagline}
            </p>
            <div className="footer-brand-social" style={{ display: "flex", gap: 10 }}>
              <SocialBtn href={BRAND.socialLinks.instagram} label="Instagram"><IGIcon /></SocialBtn>
              <SocialBtn href={BRAND.socialLinks.facebook} label="Facebook"><FBIcon /></SocialBtn>
              <SocialBtn href={BRAND.socialLinks.pinterest} label="Pinterest"><PinterestIcon /></SocialBtn>
            </div>
          </div>
          
          {/* Opening Hours column */}
          <div style={{ minWidth: 180 }}>
            <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.70rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-main)", marginBottom: 24 }}>
              Opening Hours
            </h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BRAND.hours.map((hour) => {
                if (hour.isClosed) {
                  return (
                    <li key={hour.day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: "0.84rem" }}>
                      <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{hour.day}</span>
                      <span style={{ color: "#e05555" }}>Closed</span>
                    </li>
                  );
                }
                
                const openTime = BRAND.useDefaultTime ? "09:00" : hour.openTime;
                const closeTime = BRAND.useDefaultTime ? "17:00" : hour.closeTime;
                
                return (
                  <li key={hour.day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: "0.84rem" }}>
                    <span style={{ color: "var(--text-main)", fontWeight: 600 }}>{hour.day}</span>
                    <span style={{ color: "var(--text-muted)" }}>
                      {format12HourTime(openTime)} – {format12HourTime(closeTime)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Nav columns */}
          <div className="footer-nav" style={{ display: "flex", gap: 52, justifyContent: "flex-end", flex: 1 }}>
            {FOOTER.navColumns.map((col) => (
              <div key={col.heading} style={{ minWidth: 120, textAlign: "center" }}>
                <h4 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.70rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-main)", marginBottom: 24, whiteSpace: "nowrap" }}>
                  {col.heading}
                </h4>
                <ul style={{ display: "flex", flexDirection: "column", gap: 13, alignItems: "center" }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}
                        style={{ fontSize: "0.84rem", color: "var(--text-muted)", transition: "color 0.18s", lineHeight: 1, whiteSpace: "nowrap" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
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

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: "1px solid var(--border)", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: "0.80rem", color: "var(--text-faint)" }}>
            © {year} {BRAND.name}. All Rights Reserved.
          </p>
          <p style={{ fontSize: "0.80rem", color: "var(--text-faint)" }}>
            Designed By{" "}
            <a href={FOOTER.credit.href}
              style={{ color: "var(--gold)", fontWeight: 600, transition: "opacity 0.18s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.72")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {FOOTER.credit.label}
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .footer-main { flex-wrap: wrap !important; }
          .footer-main > div:first-child { max-width: 100% !important; width: 100%; padding-bottom: 36px; border-bottom: 1px solid var(--border); }
          .footer-nav { justify-content: flex-start !important; flex-wrap: wrap; gap: 32px !important; }
        }
        @media (max-width: 600px) {
          .footer-main { padding: 48px 0 40px !important; gap: 0 !important; }
          .footer-brand { text-align: center !important; display: flex; flex-direction: column; align-items: center; padding-bottom: 32px !important; }
          .footer-brand p { text-align: center; }
          .footer-brand-social { justify-content: center !important; }
          .footer-nav { justify-content: center !important; gap: 0 !important; padding-top: 32px; width: 100%; }
          .footer-nav > div { min-width: 50% !important; padding: 12px 8px; text-align: center !important; }
          .footer-nav > div ul { align-items: center !important; }
          .footer-bottom { flex-direction: column !important; align-items: center !important; text-align: center; gap: 6px !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
