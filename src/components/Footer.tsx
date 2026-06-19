import React from "react";
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Clock } from "lucide-react";
import { FOOTER, BRAND } from "../data/siteContent";

const SocialIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const icons: Record<string, React.ReactNode> = {
    Facebook: <Facebook size={18} />,
    X: <Twitter size={18} />,
    Instagram: <Instagram size={18} />,
    LinkedIn: <Linkedin size={18} />,
    Pinterest: <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>P</span>,
  };
  return <>{icons[platform] ?? <span>{platform[0]}</span>}</>;
};

const Footer: React.FC = () => (
  <footer style={{ background: "var(--cream)", borderTop: "1px solid var(--border)", paddingTop: 64, paddingBottom: 0 }}>
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: 48, paddingBottom: 56 }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.4rem", color: "var(--charcoal)", marginBottom: 10 }}>
            {BRAND.name} ✦
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--gold)", fontStyle: "italic", marginBottom: 12 }}>
            {BRAND.tagline}
          </p>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            {BRAND.shortDescription}
          </p>
        </div>

        {/* Address */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--charcoal)", marginBottom: 18 }}>
            {FOOTER.address.label}
          </h4>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <MapPin size={18} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
            <div>
              {FOOTER.address.lines.map((l, i) => (
                <p key={i} style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{l}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Contact + Hours */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--charcoal)", marginBottom: 18 }}>
            {FOOTER.contact.label}
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            <a href={`mailto:${FOOTER.contact.email}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.95rem", color: "var(--text-muted)" }}>
              <Mail size={18} style={{ color: "var(--gold)" }} /> {FOOTER.contact.email}
            </a>
            <a href={`tel:${FOOTER.contact.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.95rem", color: "var(--text-muted)" }}>
              <Phone size={18} style={{ color: "var(--gold)" }} /> {FOOTER.contact.phone}
            </a>
          </div>

          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--charcoal)", marginBottom: 12 }}>
            {FOOTER.hours.label}
          </h4>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Clock size={18} style={{ color: "var(--gold)", marginTop: 2, flexShrink: 0 }} />
            <div>
              {FOOTER.hours.times.map((h, i) => (
                <p key={i} style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {h.day}: <span style={{ fontWeight: 500, color: "var(--text-main)" }}>{h.time}</span>
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--charcoal)", marginBottom: 18 }}>
            {FOOTER.social.label}
          </h4>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {FOOTER.social.links.map((s) => (
              <a key={s.platform} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.platform}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--charcoal)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--charcoal)")}
              >
                <SocialIcon platform={s.platform} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: "22px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", gap: 28 }}>
          {FOOTER.legal.map((l) => (
            <a key={l.label} href={l.href} style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >{l.label}</a>
          ))}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{FOOTER.copyright}</p>
      </div>
    </div>
    <style>{`
      @media (max-width: 1024px) {
        footer .container > div:first-child { grid-template-columns: 1.5fr 1fr 1fr !important; }
      }
      @media (max-width: 768px) {
        footer .container > div:first-child { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 480px) {
        footer .container > div:first-child { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </footer>
);

export default Footer;
