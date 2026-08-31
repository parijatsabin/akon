import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../data/SiteDataProvider";
import { useVisibleCount } from "../hooks/useVisibleCount";
import PageShell from "../components/PageShell";
import { resolvePillarIcon } from "../data/pillarIcons";

// ── Helpers ───────────────────────────────────────────────────
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="13" height="13" viewBox="0 0 24 24"
        fill={filled ? "var(--accent)" : "none"}
        stroke={filled ? "var(--accent)" : "var(--border-strong)"}
        strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

// ── Main Page ─────────────────────────────────────────────────
const AboutPage: React.FC = () => {
    const { about, testimonials: TESTIMONIALS, commitment: COMMITMENT } = useSiteData();

    // Testimonials — respect visibility & order from CMS
    const testimonialItems = [...TESTIMONIALS.items]
        .filter((t) => t.visible)
        .sort((a, b) => a.order - b.order);

    const visibleCount = useVisibleCount({ sm: 600, md: 960, def: 3 });
    const total = testimonialItems.length;
    const maxStart = Math.max(0, total - visibleCount);
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (resumeRef.current) clearTimeout(resumeRef.current);
    };
    const startAuto = useCallback(() => {
        timerRef.current = setInterval(() => setIndex((i) => (i >= maxStart ? 0 : i + 1)), 4000);
    }, [maxStart]);

    useEffect(() => { setIndex(0); startAuto(); return clearTimers; }, [startAuto, visibleCount]);
    useEffect(() => { setIndex((i) => Math.min(i, maxStart)); }, [maxStart]);

    const go = (n: number) => {
        clearTimers();
        setIndex(Math.max(0, Math.min(n, maxStart)));
        resumeRef.current = setTimeout(startAuto, 6000);
    };

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
                Carousel behaviour is untouched: the track still translates by
                whole slides of 100/visibleCount, so the flex basis below must
                stay in step with it. */}
            {testimonialItems.length > 0 && (
                <section className="section ab-band ab-band--tint">
                    <div className="container">
                        <header className="ab-head ab-voices-head">
                            <div>
                                <span className="tag">{TESTIMONIALS.sectionTag}</span>
                                <h2 className="ab-h2">{TESTIMONIALS.headline}</h2>
                            </div>
                            <div className="ab-arrows">
                                <button onClick={() => go(index - 1)} aria-label="Previous"
                                    disabled={index === 0} className="ab-arrow">
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={() => go(index + 1)} aria-label="Next"
                                    disabled={index === maxStart} className="ab-arrow">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </header>

                        <div className="ab-voices-frame">
                            <div className="ab-voices-track"
                                style={{ transform: `translateX(${-(index * (100 / visibleCount))}%)` }}>
                                {testimonialItems.map((t) => (
                                    <div key={t.id} className="ab-voice-slot"
                                        style={{ flexBasis: `${100 / visibleCount}%` }}>
                                        <figure className="ab-voice">
                                            <div className="ab-stars" aria-label={`${t.rating} out of 5`}>
                                                {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= t.rating} />)}
                                            </div>
                                            <blockquote className="ab-voice-quote">{t.quote}</blockquote>
                                            {/* The ANOK wordmark used to sit here beside every name.
                                                Three of them in a row competed with the reviewers,
                                                who are the point of a testimonial. */}
                                            <figcaption className="ab-voice-by">
                                                <span className="ab-voice-name">{t.author}</span>
                                                <span className="ab-voice-role">{t.title}</span>
                                            </figcaption>
                                        </figure>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {maxStart > 0 && (
                            <div className="ab-dots">
                                {Array.from({ length: maxStart + 1 }).map((_, i) => (
                                    <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
                                        className={`ab-dot${i === index ? " is-active" : ""}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

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
