import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import { SocialLinkList } from "./SocialLinks";


/**
 * Footer link columns. These were three CMS tables (columns, links, and the
 * join) for six links that point at fixed routes. They are constants now —
 * changing a label is a code change, which is the trade accepted when the
 * navigation tables were dropped.
 */
const FOOTER_NAV_COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Story", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
] as const;

const Footer: React.FC = () => {
  const { footer: FOOTER, brand: BRAND } = useSiteData();
  const year = new Date().getFullYear();

  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
  };

  return (
    <footer className="footer-root on-noir">
      <div className="container">
        <div className="footer-main">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">{BRAND.name}</div>
            <p className="footer-tagline">{FOOTER.tagline}</p>
            <SocialLinkList links={BRAND.socialLinks} />
          </div>

          {/* Nav + Hours */}
          <div className="footer-nav">
            {FOOTER_NAV_COLUMNS.map((col) => (
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
