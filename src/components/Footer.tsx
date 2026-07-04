import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const IGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const FBIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const PinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const Footer: React.FC = () => {
  const { footer: FOOTER, brand: BRAND } = useSiteData();
  const year = new Date().getFullYear();

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
  };

  return (
    <footer className="footer-root">
      <div className="container">
        <div className="footer-main">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">{BRAND.name}</div>
            <p className="footer-tagline">{FOOTER.tagline}</p>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { href: BRAND.socialLinks.instagram, label: "Instagram", icon: <IGIcon /> },
                { href: BRAND.socialLinks.facebook, label: "Facebook", icon: <FBIcon /> },
                { href: BRAND.socialLinks.pinterest, label: "Pinterest", icon: <PinIcon /> },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="social-btn">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav + Hours */}
          <div className="footer-nav">
            {FOOTER.navColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="footer-col-heading">{col.heading}</h4>
                <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/")
                        ? <Link to={link.href} className="footer-link">{link.label}</Link>
                        : <a href={link.href} className="footer-link">{link.label}</a>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Opening Hours */}
            <div>
              <h4 className="footer-col-heading">Opening Hours</h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {BRAND.hours.map((hour) => {
                  const open = BRAND.useDefaultTime ? "09:00" : hour.openTime;
                  const close = BRAND.useDefaultTime ? "17:00" : hour.closeTime;
                  return (
                    <li key={hour.day} className="footer-hours-row">
                      <span style={{ fontWeight: 600, color: hour.isClosed ? "var(--text-faint)" : "var(--text-main)" }}>{hour.day}</span>
                      {hour.isClosed
                        ? <span className="footer-closed">Closed</span>
                        : <span style={{ color: "var(--text-muted)", whiteSpace: "nowrap", fontSize: "0.80rem" }}>{fmt(open)} – {fmt(close)}</span>
                      }
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {year} {BRAND.name}. All Rights Reserved.</p>
          <p className="footer-copy">
            Designed by <a href={FOOTER.credit.href} className="footer-credit">{FOOTER.credit.label}</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
