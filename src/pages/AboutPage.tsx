import React from "react";
import { Link } from "react-router-dom";
import { useSiteData } from "../data/SiteDataProvider";
import PageShell from "../components/PageShell";
import Testimonials from "../components/Testimonials";
import { resolvePillarIcon } from "../data/pillarIcons";

// ── Main Page ─────────────────────────────────────────────────
const AboutPage: React.FC = () => {
    const { about, commitment: COMMITMENT } = useSiteData();

    return (
        <PageShell>
            {/* ── Brand story ──────────────────────────────────────────
                Copy only. The pull-quote (about.brandQuote) and the CTA
                (about.cta) were removed from this section by request; both
                fields are still stored and still returned by the API, they are
                simply not rendered here — and nothing else on the site reads
                them. See AboutEditor for the matching admin change. */}
            <section className="section-page ab-band ab-band--canvas">
                <div className="container ab-story">
                    <div className="ab-story-head">
                        <span className="tag">{about.sectionLabel}</span>
                        <h1 className="ab-h1">{about.headline}</h1>
                    </div>
                    <div className="ab-story-copy">
                        <p className="ab-lede">{about.body}</p>
                        {about.bodyExtended && <p className="ab-body ab-body--last">{about.bodyExtended}</p>}
                    </div>
                </div>
            </section>

            {/* ── Why choose us ────────────────────────────────────────
                Numbered entries on hairlines rather than four bordered cards.
                The numeral replaces the old ICONS map, which was keyed by the
                literal reason id ("01".."04") and fell back to a blank circle
                the moment an editor added or renamed one. */}
            <section className="section ab-band ab-band--tint">
                <div className="container">
                    <header className="ab-head ab-head--center">
                        <span className="tag">{about.differenceSectionTag}</span>
                        <h2 className="ab-h2">{about.whyHeadline}</h2>
                        <p className="ab-head-note">{about.whyTagline}</p>
                    </header>

                    <ol className="ab-reasons">
                        {about.reasons.map((r, i) => (
                            <li key={r.id} className="ab-reason">
                                <span className="ab-reason-num" aria-hidden="true">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <h3 className="ab-reason-title">{r.title}</h3>
                                <p className="ab-reason-body">{r.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── Commitment ───────────────────────────────────────────
                Heading leads, pillars follow. Previously the four pillar cards
                sat to the LEFT of the heading, so the evidence was read before
                the claim it supports. */}
            <section className="section ab-band ab-band--canvas">
                <div className="container ab-commit">
                    <div className="ab-commit-copy">
                        <span className="tag">{COMMITMENT.tag}</span>
                        <h2 className="ab-h2">{COMMITMENT.headline}</h2>
                        <p className="ab-body">{COMMITMENT.body}</p>
                        <Link to="/fragrance" className="btn btn-outline">Explore Our Signature Scent</Link>
                    </div>

                    <ul className="ab-pillars">
                        {COMMITMENT.pillars.map((p, i) => {
                            // Editor's choice from the CMS; falls back by position
                            // for rows still holding a pre-picker emoji.
                            const Icon = resolvePillarIcon(p.icon, i);
                            return (
                                <li key={p.id} className="ab-pillar">
                                    <Icon className="ab-pillar-icon" size={19} strokeWidth={1.6} aria-hidden="true" />
                                    <div>
                                        <h3 className="ab-pillar-title">{p.title}</h3>
                                        <p className="ab-pillar-body">{p.body}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ── Customer reviews ─────────────────────────────────────
                Shared with the homepage and /fragrance: those two pages carry
                the Product structured data, and Google only accepts review
                markup for reviews the reader can see on the same page. */}
            <Testimonials />

            {/* ── CTA strip ── */}
            {/* With a photo the copy flips to white over a scrim; without one it
                keeps the original flat-colour, dark-text treatment. */}
            <div className={`about-cta-strip${about.ctaStripImage !== "" ? " has-image" : ""}`}>
                {about.ctaStripImage !== "" && (
                    <>
                        <img className="about-cta-bg" src={about.ctaStripImage} alt="" aria-hidden="true" loading="lazy" />
                        <div className="about-cta-scrim" />
                    </>
                )}
                <div className="container about-cta-inner">
                    <span className="about-cta-tag">{about.ctaStripTag}</span>
                    <h2 className="about-cta-heading">{about.ctaStripHeading}</h2>
                    <p className="about-cta-body">{about.body}</p>
                    <div className="about-cta-actions">
                        <Link to="/fragrance" className="btn btn-accent">View Our Signature Scent</Link>
                        <Link to="/contact" className="btn btn-solid">Contact Us</Link>
                    </div>
                </div>
            </div>
        </PageShell>
    );
};

export default AboutPage;
