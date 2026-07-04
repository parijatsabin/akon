import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteData } from "../PublicSite";
import { useVisibleCount } from "../hooks/useVisibleCount";

const AUTO_DELAY = 4000;
const RESUME_AFTER = 6000;

const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < count ? "var(--gold)" : "none"} stroke={i < count ? "var(--gold)" : "var(--border)"} strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

const Testimonials: React.FC = () => {
  const { testimonials: TESTIMONIALS, brand: BRAND } = useSiteData();
  const items = TESTIMONIALS.items;
  const visibleCount = useVisibleCount({ sm: 600, md: 960, def: 3 });
  const maxStart = Math.max(0, items.length - visibleCount);

  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (resumeRef.current) clearTimeout(resumeRef.current);
  };
  const startAuto = useCallback(() => { timerRef.current = setInterval(() => setIndex((i) => (i >= maxStart ? 0 : i + 1)), AUTO_DELAY); }, [maxStart]);
  const resumeAuto = useCallback(() => startAuto(), [startAuto]);

  useEffect(() => { setIndex(0); startAuto(); return clearTimers; }, [startAuto, visibleCount]);
  useEffect(() => { setIndex((i) => Math.min(i, maxStart)); }, [maxStart]);

  const go = (n: number) => {
    clearTimers();
    setIndex(Math.max(0, Math.min(n, maxStart)));
    resumeRef.current = setTimeout(resumeAuto, RESUME_AFTER);
  };

  return (
    <section id="reviews" className="section bg-white">
      <div className="container">
        <div className="testi-header">
          <div>
            <span className="tag">Voices of Trust</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,2.8vw,2.4rem)", fontWeight: 700, color: "var(--text-main)", lineHeight: 1.15 }}>
              {TESTIMONIALS.headline}
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10, alignSelf: "center" }}>
            <button className="carousel-btn" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous"><ChevronLeft size={18} /></button>
            <button className="carousel-btn" onClick={() => go(index + 1)} disabled={index === maxStart} aria-label="Next"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflow: "hidden" }}>
            <div className="testi-track" style={{ display: "flex", transform: `translateX(${-(index * (100 / visibleCount))}%)`, transition: "transform 0.58s cubic-bezier(0.25,0.46,0.45,0.94)", willChange: "transform" }}>
              {items.map((t, i) => (
                <div key={t.id} style={{ flex: `0 0 ${100 / visibleCount}%`, minWidth: 0 }}>
                  <div className={`testi-card${i > 0 ? "" : ""}`} style={{ borderLeft: i > 0 ? "1px solid var(--border)" : "none" }}>
                    <div className="testi-quote-mark">"</div>
                    <Stars count={t.rating} />
                    <p className="testi-text">"{t.quote}"</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div className="testi-author">{t.author}</div>
                        <div className="testi-role">{t.title}</div>
                      </div>
                      <div className="testi-brand">{BRAND.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {maxStart > 0 && (
          <div className="dot-track">
            {Array.from({ length: maxStart + 1 }).map((_, i) => (
              <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} className={`dot${i === index ? " active" : ""}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
