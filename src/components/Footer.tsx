import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import { SocialLinkList } from "./SocialLinks";
import ReviewForm from "./ReviewForm";


/**
 * Footer link columns. These were three CMS tables (columns, links, and the
 * join) for six links that point at fixed routes. They are constants now —
 * changing a label is a code change, which is the trade accepted when the
 * navigation tables were dropped.
 */
/**
 * Who built the site. Not content the owner maintains — leaving it editable
 * invited it being changed by accident — so it lives with the build.
 */
const BUILD_CREDIT = {
  label: "Sabin Ghimire",
  href: "https://ghimiresabin.com.np",
} as const;

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
      { label: "Ingredients & Safety", href: "/fragrance#composition" },
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

  /**
   * Seven rows that all say "09:00 AM – 05:00 PM" is seven rows of noise; a
   * reader has to compare every one to learn the single fact that the hours
   * never change. Consecutive days sharing a schedule collapse into one range,
   * so identical weeks render as "Monday – Sunday" while a shop that closes on
   * Saturdays still shows that day on its own. Order is preserved — the ranges
   * are built by walking BRAND.hours, never by sorting it.
   */
  const hourGroups = BRAND.hours.reduce<
    { from: string; to: string; isClosed: boolean; open: string; close: string }[]
  >((groups, hour) => {
    const open = BRAND.useDefaultTime ? "09:00" : hour.openTime;
    const close = BRAND.useDefaultTime ? "17:00" : hour.closeTime;
    const last = groups[groups.length - 1];

    if (last && last.isClosed === hour.isClosed && last.open === open && last.close === close) {
      last.to = hour.day;
      return groups;
    }
    groups.push({ from: hour.day, to: hour.day, isClosed: hour.isClosed, open, close });
    return groups;
  }, []);

  return (
    <footer className="footer-root on-noir">
      <div className="container">
        <div className="footer-main">
          {/* Brand */}
          <div>
            <div className="footer-brand-name">{BRAND.name}</div>
            <p className="footer-tagline">{FOOTER.tagline}</p>
            <SocialLinkList links={BRAND.socialLinks} />
            {/* Sits with the brand rather than in the link columns: those are
                routes, and this opens a dialog. It is in the footer so it
                reaches a reader from any page, at the point they have
                finished reading one. */}
            <ReviewForm />
          </div>

          {/* Nav + Hours */}
          <div className="footer-nav">
            {FOOTER_NAV_COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="footer-col-heading">{col.heading}</h3>
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
              <h3 className="footer-col-heading">Opening Hours</h3>
              <dl className="footer-hours">
                {hourGroups.map((g) => (
                  <div
                    key={g.from}
                    className={`footer-hours-row${g.isClosed ? " footer-hours-row--closed" : ""}`}
                  >
                    <dt className="footer-hours-day">
                      {g.from === g.to ? g.from : `${g.from} – ${g.to}`}
                    </dt>
                    <dd className={g.isClosed ? "footer-closed" : "footer-hours-time"}>
                      {g.isClosed ? "Closed" : `${fmt(g.open)} – ${fmt(g.close)}`}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© {year} {BRAND.name}. All Rights Reserved.</p>
          <p className="footer-copy">
            Designed by{" "}
            <a
              href={BUILD_CREDIT.href}
              className="footer-credit"
              target="_blank"
              rel="noopener noreferrer"
            >
              {BUILD_CREDIT.label}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
