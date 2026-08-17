import React, { useState } from "react";
import { useSiteData } from "../data/SiteDataProvider";
import { useReveal } from "../hooks/useReveal";
import { supabase } from "../lib/supabase";

const Newsletter: React.FC = () => {
  const { newsletter: NEWSLETTER, brand: BRAND } = useSiteData();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useReveal<HTMLDivElement>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || pending) return;

    setPending(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("contacts")
      .insert({ kind: "newsletter", email: value });

    setPending(false);

    // 23505 = unique violation, i.e. already subscribed. Reported as success:
    // telling a stranger which addresses are on the list would leak it one
    // guess at a time, and from the subscriber's point of view it worked.
    if (insertError && insertError.code !== "23505") {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setEmail("");
  };

  return (
    <section id="newsletter" className="newsletter-section on-noir">
      {/* Optional photo band. The dark scrim keeps the white copy readable
          whatever image an editor picks. */}
      {NEWSLETTER.backgroundImage !== "" && (
        <>
          <img className="newsletter-bg" src={NEWSLETTER.backgroundImage} alt="" aria-hidden="true" loading="lazy" />
          <div className="newsletter-scrim" />
        </>
      )}

      <div className="newsletter-ring" style={{ right: -100, top: -100, width: 340, height: 340 }} />
      <div className="newsletter-ring" style={{ right: -50, top: -50, width: 220, height: 220, opacity: 0.6 }} />
      <div className="newsletter-ring" style={{ left: -60, bottom: -60, width: 240, height: 240, opacity: 0.4 }} />

      <div ref={ref} className="container newsletter-inner reveal reveal-stagger">
        <div className="section-label" style={{ justifyContent: "center", marginBottom: 20 }}>
          <span className="section-label-line" />
          <span className="eyebrow">{NEWSLETTER.eyebrow}</span>
          <span className="section-label-line" />
        </div>

        <h2 className="newsletter-title">
          {NEWSLETTER.headline}{" "}<span className="newsletter-brand">{NEWSLETTER.brandHighlight}</span>
        </h2>
        <p className="newsletter-sub">{NEWSLETTER.subtext}</p>

        {submitted ? (
          <div className="newsletter-success">
            ✓ Thank you! You've been subscribed to {BRAND.name}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={NEWSLETTER.placeholder} required disabled={pending}
              className="newsletter-input"
            />
            <button type="submit" disabled={pending} className="btn btn-accent newsletter-btn" style={{ borderRadius: 0, whiteSpace: "nowrap", padding: "18px 34px", fontSize: "0.82rem" }}>
              {pending ? "Subscribing…" : NEWSLETTER.cta}
            </button>
          </form>
        )}

        {error && (
          <p role="alert" className="newsletter-sub" style={{ marginTop: 12, opacity: 0.95 }}>
            {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
