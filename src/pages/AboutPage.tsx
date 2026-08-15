import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../data/SiteDataProvider";
import { useVisibleCount } from "../hooks/useVisibleCount";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Helpers ───────────────────────────────────────────────────
const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg width="13" height="13" viewBox="0 0 24 24"
        fill={filled ? "var(--accent)" : "none"}
        stroke={filled ? "var(--accent)" : "var(--border)"}
        strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const ICONS: Record<string, React.ReactNode> = {
    "01": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    "02": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    "03": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    "04": <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
};

// ── Main Page ─────────────────────────────────────────────────
const AboutPage: React.FC = () => {
    const { about, brand: BRAND, testimonials: TESTIMONIALS, commitment: COMMITMENT } = useSiteData();

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
    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

    const go = (n: number) => {
        clearTimers();
        setIndex(Math.max(0, Math.min(n, maxStart)));
        resumeRef.current = setTimeout(startAuto, 6000);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--white)" }}>
            <Navbar />

            {/* ── Brand Story ── */}
            <section className="section" style={{ background: "var(--surface)", paddingTop: 120 }}>
                <div className="container">
                    <div className="ab-story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                        {/* Text */}
                        <div>
                            <span className="tag">{about.sectionLabel}</span>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 22 }}>
                                {about.headline}
                            </h2>
                            <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 20 }}>
                                {about.body}
                            </p>
                            {about.bodyExtended && (
                                <p style={{ fontSize: "0.96rem", color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 36 }}>
                                    {about.bodyExtended}
                                </p>
                            )}
                            <Link to={about.cta.href} className="btn btn-solid">{about.cta.label}</Link>
                        </div>

                        {/* Quote card */}
                        <div style={{ background: "var(--sunken-deep)", borderRadius: "var(--radius-lg)", padding: "52px 44px", position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
                            <div style={{ position: "absolute", top: 8, right: 24, fontFamily: "var(--font-display)", fontSize: "9rem", lineHeight: 1, color: "var(--accent)", opacity: 0.07, userSelect: "none", pointerEvents: "none" }}>"</div>
                            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(1rem, 1.6vw, 1.25rem)", lineHeight: 1.8, color: "var(--text-main)", marginBottom: 28 }}>
                                "{about.brandQuote}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div className="gold-rule" />
                                <span style={{ fontFamily: "var(--font-body)", fontSize: "0.74rem", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent-text)" }}>
                                    {BRAND.name} — {BRAND.tagline}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why Choose Us ── */}
            <section className="section" style={{ background: "var(--sunken)" }}>
                <div className="container">
                    <div style={{ textAlign: "center", marginBottom: 56 }}>
                        <span className="tag">{about.differenceSectionTag}</span>
                        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, color: "var(--text-main)", marginBottom: 12 }}>
                            {about.whyHeadline}
                        </h2>
                        <p style={{ fontSize: "0.96rem", color: "var(--accent-text)", fontStyle: "italic", fontWeight: 500 }}>
                            {about.whyTagline}
                        </p>
                    </div>

                    <div className="ab-reasons" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
                        {about.reasons.map((r) => (
                            <div key={r.id}
                                style={{ padding: "34px 28px", borderRadius: "var(--radius)", border: "1px solid var(--border)", background: "var(--surface-raised)", display: "flex", flexDirection: "column", gap: 14, transition: "box-shadow 0.28s, transform 0.28s, border-color 0.28s" }}
                                onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-6px)"; el.style.boxShadow = "var(--shadow-accent)"; el.style.borderColor = "var(--accent-soft)"; }}
                                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; el.style.borderColor = "var(--border)"; }}
                            >
                                <div style={{ width: 46, height: 46, borderRadius: "var(--radius-sm)", background: "var(--sunken-deep)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-text)", flexShrink: 0 }}>
                                    {ICONS[r.id] ?? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10" /></svg>}
                                </div>
                                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent-soft)" }}>{r.id}</div>
                                <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.05rem", color: "var(--text-main)", lineHeight: 1.2 }}>{r.title}</h4>
                                <p style={{ fontSize: "0.87rem", color: "var(--text-muted)", lineHeight: 1.75 }}>{r.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Commitment — pillars from CMS ── */}
            <section style={{ background: "var(--sunken-deep)", padding: "72px 0" }}>
                <div className="container">
                    <div className="ab-commit" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
                        {/* Pillars */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            {COMMITMENT.pillars.map((p) => (
                                <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 18, padding: "20px 22px", background: "var(--surface)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "var(--sunken-deep)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                                        {p.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.96rem", color: "var(--text-main)", marginBottom: 4 }}>{p.title}</div>
                                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.7 }}>{p.body}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <span className="tag">{COMMITMENT.tag}</span>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.1, color: "var(--text-main)", marginBottom: 20 }}>
                                {COMMITMENT.headline}
                            </h2>
                            <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: 32 }}>
                                {COMMITMENT.body}
                            </p>
                            {/* Plain <a>: a cross-page hash needs a real navigation so the
                                browser scrolls to #signature. <Link> would not scroll. */}
                            <a href="/#signature" className="btn btn-solid">Explore Our Signature Scent</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Customer Reviews ── */}
            {testimonialItems.length > 0 && (
                <section className="section" style={{ background: "var(--surface)" }}>
                    <div className="container">
                        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, gap: 16, flexWrap: "wrap" }}>
                            <div>
                                <span className="tag">{TESTIMONIALS.sectionTag}</span>
                                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.15 }}>
                                    {TESTIMONIALS.headline}
                                </h2>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignSelf: "center" }}>
                                <button onClick={() => go(index - 1)} aria-label="Previous" disabled={index === 0}
                                    style={{ width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === 0 ? "not-allowed" : "pointer", color: "var(--text-main)", transition: "all 0.22s", opacity: index === 0 ? 0.4 : 1 }}
                                    onMouseEnter={(e) => { if (index !== 0) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}>
                                    <ChevronLeft size={18} />
                                </button>
                                <button onClick={() => go(index + 1)} aria-label="Next" disabled={index === maxStart}
                                    style={{ width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === maxStart ? "not-allowed" : "pointer", color: "var(--text-main)", transition: "all 0.22s", opacity: index === maxStart ? 0.4 : 1 }}
                                    onMouseEnter={(e) => { if (index !== maxStart) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div style={{ borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                            <div style={{ overflow: "hidden" }}>
                                <div style={{ display: "flex", transform: `translateX(${-(index * (100 / visibleCount))}%)`, transition: "transform 0.58s cubic-bezier(0.25,0.46,0.45,0.94)", willChange: "transform" }}>
                                    {testimonialItems.map((t, i) => (
                                        <div key={t.id} style={{ flex: `0 0 ${100 / visibleCount}%`, minWidth: 0 }}>
                                            <div style={{ background: "var(--surface-raised)", padding: "36px 32px 32px", display: "flex", flexDirection: "column", height: "100%", borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                                                <div style={{ fontSize: "2.8rem", lineHeight: 1, color: "var(--accent)", fontFamily: "Georgia,serif", fontWeight: 700, marginBottom: 14, opacity: 0.65, userSelect: "none" }}>"</div>
                                                <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                                                    {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= t.rating} />)}
                                                </div>
                                                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.78, color: "var(--text-main)", marginBottom: 26, flexGrow: 1, fontStyle: "italic" }}>
                                                    "{t.quote}"
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)", marginBottom: 3 }}>{t.author}</div>
                                                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{t.title}</div>
                                                    </div>
                                                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1rem", letterSpacing: "0.18em", color: "var(--accent-text)", opacity: 0.7, flexShrink: 0 }}>{BRAND.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {maxStart > 0 && (
                            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 10 }}>
                                {Array.from({ length: maxStart + 1 }).map((_, i) => (
                                    <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
                                        style={{ padding: 0, border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center" }}>
                                        <div style={{ width: i === index ? 32 : 8, height: 8, borderRadius: 4, background: i === index ? "var(--accent)" : "var(--border)", transition: "all 0.38s ease" }} />
                                    </button>
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
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                        <a href="/#signature" className="btn btn-accent">View Our Signature Scent</a>
                        <Link to="/contact" className="btn btn-solid">Contact Us</Link>
                    </div>
                </div>
            </div>

            <Footer />

            <style>{`
        @media (max-width: 900px) {
          .ab-story-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
          .ab-commit { grid-template-columns: 1fr !important; gap: 36px !important; text-align: center; }
          .ab-commit > div:first-child { order: -1; }
          .ab-commit > div:last-child { display: flex; flex-direction: column; align-items: center; }
          .ab-reasons { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 520px) {
          .ab-reasons { grid-template-columns: 1fr !important; }
        }
      `}</style>
        </div>
    );
};

export default AboutPage;
