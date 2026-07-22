import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../PublicSite";

const Commitment: React.FC = () => {
  const { commitment: COMMITMENT } = useSiteData();

  return (
    <section className="section bg-parchment">
      <div style={{ textAlign: "center" }}>
        <span className="tag">Our Promise</span>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem,3.6vw,3rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "var(--text-main)",
            marginBottom: 24,
          }}
        >
          {COMMITMENT.headline}
        </h2>

        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-muted)",
            lineHeight: 1.9,
            marginBottom: 38,
          }}
        >
          {COMMITMENT.body}
        </p>

        <Link
          to="/about"
          className="btn btn-dark"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {COMMITMENT.cta.label}
        </Link>
      </div>
    </section>
  );
};

export default Commitment;