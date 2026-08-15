import React from "react";
import { useSiteData } from "../data/SiteDataProvider";
import { useReveal } from "../hooks/useReveal";
import SmartLink from "./SmartLink";

const Commitment: React.FC = () => {
  const { commitment: COMMITMENT } = useSiteData();
  const ref = useReveal<HTMLDivElement>();
  const hasImage = COMMITMENT.imageUrl !== "";

  const copy = (
    <div>
      <span className="tag">{COMMITMENT.tag}</span>
      <h2 className="commit-headline">{COMMITMENT.headline}</h2>
      <p className="commit-body">{COMMITMENT.body}</p>
      <div>
        <SmartLink href={COMMITMENT.cta.href} className="btn btn-solid">
          {COMMITMENT.cta.label}
        </SmartLink>
      </div>
    </div>
  );

  return (
    <section className="section bg-sunken">
      <div className="container">
        {/* Without a photo this falls back to the original centred, text-only block. */}
        <div ref={ref} className={`reveal reveal-stagger ${hasImage ? "commit-split" : "commit-block"}`}>
          {hasImage && (
            <div className="commit-img-wrap">
              <img src={COMMITMENT.imageUrl} alt={COMMITMENT.headline} loading="lazy" />
            </div>
          )}
          {copy}
        </div>
      </div>
    </section>
  );
};

export default Commitment;
