/**
 * The customer reviews carousel.
 *
 * Lifted out of AboutPage, which owned it inline, because the reviews now have
 * to appear on every page that carries Product structured data. Google only
 * accepts review markup for content a reader can actually see on that page, so
 * the JSON-LD's `review` and `aggregateRating` on / and /fragrance are backed
 * by this section being rendered there too. AboutPage keeps it as well — it is
 * the same section it always was, in the same band.
 *
 * Behaviour is unchanged from the original: auto-advance every 4s, paused for
 * 6s after any manual move, and the track translates by whole slides of
 * 100/visibleCount, which the slot flex-basis below must stay in step with.
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../data/SiteDataProvider";
import { useVisibleCount } from "../hooks/useVisibleCount";

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="13" height="13" viewBox="0 0 24 24"
        fill={filled ? "var(--accent)" : "none"}
        stroke={filled ? "var(--accent)" : "var(--border-strong)"}
        strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

/** `tint` picks the band shading; About alternates bands, the other two pages
 *  sit the section on plain canvas. */
const Testimonials: React.FC<{ tint?: boolean }> = ({ tint = true }) => {
    const { testimonials: TESTIMONIALS } = useSiteData();

    // Respect visibility & order from the CMS.
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

    if (testimonialItems.length === 0) return null;

    return (
        <section className={`section ab-band${tint ? " ab-band--tint" : " ab-band--canvas"}`}>
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
                                    {/* The name alone. The ANOK wordmark used to sit here
                                        beside it, and a role line under it ("Lifestyle
                                        Curator") beneath that — neither belonged to the
                                        reviewer. Reviews come from customers through the
                                        footer form now, and a customer has no job title
                                        here; inventing one made the quotes read as
                                        marketing rather than as people. */}
                                    <figcaption className="ab-voice-by">
                                        <span className="ab-voice-name">{t.author}</span>
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
    );
};

export default Testimonials;
