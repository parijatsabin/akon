import React from "react";
import { useSiteData } from "../PublicSite";

const Commitment: React.FC = () => {
  const { commitment: COMMITMENT, featuredProduct } = useSiteData();

  return (
    <section className="section bg-parchment">
      <div className="container commit-grid">
        {/* Image */}
        <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="commit-img-wrap">
            <img src={featuredProduct.imageUrl} alt={featuredProduct.name} />
          </div>
          <div className="commit-badge-pos frosted-badge">
            <div className="eyebrow" style={{ marginBottom: 3 }}>Our Promise</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.98rem", fontWeight: 700, color: "var(--text-main)" }}>100% Natural</div>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="tag">Our Promise</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,3.6vw,3rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 24 }}>
            {COMMITMENT.headline}
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 38 }}>
            {COMMITMENT.body}
          </p>
          <a href={COMMITMENT.cta.href} className="btn btn-dark">{COMMITMENT.cta.label}</a>
        </div>
      </div>
    </section>
  );
};

export default Commitment;
