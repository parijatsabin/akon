import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const Commitment: React.FC = () => {
  const { commitment: COMMITMENT } = useSiteData();
  const isRoute = COMMITMENT.cta.href.startsWith("/");

  return (
    <section className="section bg-parchment">
      <div style={{ textAlign: "center" }}>
        <span className="tag">{COMMITMENT.tag}</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,3.6vw,3rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 24 }}>
          {COMMITMENT.headline}
        </h2>
        <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 38 }}>
          {COMMITMENT.body}
        </p>
        {isRoute
          ? <Link to={COMMITMENT.cta.href} className="btn btn-dark">{COMMITMENT.cta.label}</Link>
          : <a href={COMMITMENT.cta.href} className="btn btn-dark">{COMMITMENT.cta.label}</a>
        }
      </div>
    </section>
  );
};

export default Commitment;
