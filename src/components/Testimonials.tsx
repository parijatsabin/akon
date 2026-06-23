import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../PublicSite";

const AUTO_DELAY = 4000;
const RESUME_AFTER = 6000;

/* ── Responsive visible count ───────────────────────────────── */
function useVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 600) setCount(1);
      else if (w < 960) setCount(2);
      else setCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

/* ── Quote mark ─────────────────────────────────────────────── */
const QuoteMark: React.FC = () => (
  <div style={{ fontSize: "2.8rem", lineHeight: 1, color: "var(--gold)", fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 14, userSelect: "none", opacity: 0.65 }}>"</div>
);

/* ── Stars ──────────────────────────────────────────────────── */
const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < count ? "var(--gold)" : "none"} stroke={i < count ? "var(--gold)" : "var(--border)"} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* ── Card ───────────────────────────────────────────────────── */
interface CardProps {
  quote: string;
  author: string;
  title: string;
  rating: number;
  brandName: string;
  showLeftBorder: boolean;
}

const TestimonialCard: React.FC<CardProps> = ({ quote, author, title, rating, brandName, showLeftBorder }) => (
  <div style={{
    flex: "1 1 0",
    minWidth: 0,
    background: "#fff",
    padding: "36px 32px 32px",
    display: "flex",
    flexDirection: "column",
    borderLeft: showLeftBorder ? "1px solid var(--border)" : "none",
  }}>
    <QuoteMark />
    <Stars count={rating} />
    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", lineHeight: 1.78, color: "var(--text-main)", marginBottom: 26, flexGrow: 1, fontStyle: "italic" }}>
      "{quote}"
    </p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.88rem", color: "var(--text-main)", marginBottom: 3 }}>{author}</div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: "0.76rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{title}</div>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "0.18em", color: "var(--gold)", textTransform: "uppercase", opacity: 0.75, userSelect: "none", flexShrink: 0 }}>
        {brandName}
      </div>
    </div>
  </div>
);

/* ── Testimonials carousel ──────────────────────────────────── */
const Testimonials: React.FC = () => {
  const { testimonials: TESTIMONIALS, brand: BRAND } = useSiteData();
  const items = TESTIMONIALS.items;
  const total = items.length;
  const visibleCount = useVisibleCount();
  const maxStart = Math.max(0, total - visibleCount);

  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
  };

  const startAuto = useCallback(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i >= maxStart ? 0 : i + 1));
    }, AUTO_DELAY);
  }, [maxStart]);

  const stopAuto = useCallback(() => { clearTimers(); }, []);
  const resumeAuto = useCallback(() => { startAuto(); }, [startAuto]);

  useEffect(() => {
    setIndex(0);
    startAuto();
    return clearTimers;
  }, [startAuto, visibleCount]);

  // Keep index in bounds when visibleCount changes
  useEffect(() => {
    setIndex((i) => Math.min(i, maxStart));
  }, [maxStart]);

  const go = (newIndex: number) => {
    stopAuto();
    setIndex(Math.max(0, Math.min(newIndex, maxStart)));
    resumeRef.current = setTimeout(resumeAuto, RESUME_AFTER);
  };

  const translatePct = -(index * (100 / visibleCount));

  return (
    <section id="reviews" className="section" style={{ background: "var(--warm-white)" }}>
      <div className="container">

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 44, gap: 16, flexWrap: "wrap" }}>
          <div>
            <span className="tag">Voices of Trust</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.15 }}>
              {TESTIMONIALS.headline}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10, alignSelf: "center" }}>
            <button
              onClick={() => go(index - 1)} aria-label="Previous" disabled={index === 0}
              style={{ width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === 0 ? "not-allowed" : "pointer", color: "var(--text-main)", transition: "all 0.22s", opacity: index === 0 ? 0.4 : 1 }}
              onMouseEnter={(e) => { if (index !== 0) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => go(index + 1)} aria-label="Next" disabled={index === maxStart}
              style={{ width: 42, height: 42, border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: index === maxStart ? "not-allowed" : "pointer", color: "var(--text-main)", transition: "all 0.22s", opacity: index === maxStart ? 0.4 : 1 }}
              onMouseEnter={(e) => { if (index !== maxStart) { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-main)"; }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel track */}
        <div style={{ borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              display: "flex",
              transform: `translateX(${translatePct}%)`,
              transition: "transform 0.58s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "transform",
            }}>
              {items.map((t, i) => (
                <div
                  key={t.id}
                  style={{ flex: `0 0 ${100 / visibleCount}%`, minWidth: 0 }}
                >
                  <TestimonialCard
                    quote={t.quote}
                    author={t.author}
                    title={t.title}
                    rating={t.rating}
                    brandName={BRAND.name}
                    showLeftBorder={i > 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots */}
        {maxStart > 0 && (
          <div style={{ marginTop: 30, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
            {Array.from({ length: maxStart + 1 }).map((_, i) => (
              <button
                key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`}
                style={{ padding: 0, border: "none", cursor: "pointer", background: "none", display: "flex", alignItems: "center" }}
              >
                <div style={{ width: i === index ? 32 : 8, height: 8, borderRadius: 4, background: i === index ? "var(--gold)" : "var(--border)", transition: "all 0.38s ease" }} />
              </button>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonials;
