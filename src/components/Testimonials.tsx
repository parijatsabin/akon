import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, BRAND } from "../data/siteContent";

// Brand wordmark shown on each card
const BrandMark: React.FC = () => (
  <div style={{
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "1.25rem",
    letterSpacing: "0.15em",
    color: "var(--charcoal)",
    textTransform: "uppercase",
    userSelect: "none",
  }}>
    {BRAND.name}
  </div>
);

// Large teal opening quote glyph
const QuoteMark: React.FC = () => (
  <div style={{
    fontSize: "2.8rem",
    lineHeight: 1,
    color: "#3a8fa3",
    fontFamily: "Georgia, serif",
    fontWeight: 700,
    marginBottom: 12,
    userSelect: "none",
  }}>"</div>
);

// Single testimonial card
interface CardProps {
  quote: string;
  author: string;
  title: string;
  index?: number;
}

const TestimonialCard: React.FC<CardProps> = ({ quote, author, title, index = 0 }) => (
  <div style={{
    flex: "1 1 0",
    minWidth: 0,
    background: "transparent",
    padding: "32px 28px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    borderLeft: index > 0 ? "1px solid rgba(0,0,0,0.08)" : "none",
    transition: "background 0.2s",
  }}>
    <QuoteMark />
    <p style={{
      fontFamily: "var(--font-body)",
      fontSize: "0.9rem",
      lineHeight: 1.7,
      color: "#3d3d3d",
      marginBottom: 24,
      flexGrow: 1,
    }}>
      "{quote}"
    </p>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <div>
        <div style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: "0.88rem",
          color: "#3a8fa3",
          marginBottom: 2,
        }}>{author}</div>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
        }}>{title}</div>
      </div>
      <BrandMark />
    </div>
  </div>
);

const CARDS_PER_PAGE = 3;

const Testimonials: React.FC = () => {
  const [page, setPage] = useState(0);
  const items = TESTIMONIALS.items;
  const totalPages = Math.ceil(items.length / CARDS_PER_PAGE);

  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const next = () => setPage((p) => (p + 1) % totalPages);

  const visible = items.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE,
  );

  // Pad to always show 3 cards
  while (visible.length < CARDS_PER_PAGE) {
    visible.push(items[visible.length % items.length]);
  }

  return (
    <section
      id="reviews"
      className="section"
      style={{
        background: "linear-gradient(135deg, #eef4f7 0%, #f5f8f0 100%)",
      }}
    >
      <div className="container">
        {/* Header row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 40,
          gap: 16,
          flexWrap: "wrap",
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 2.8vw, 2.2rem)",
            fontWeight: 600,
            color: "var(--charcoal)",
            lineHeight: 1.2,
            maxWidth: 340,
          }}>
            {TESTIMONIALS.headline}
          </h2>

          {/* Navigation arrows — top right */}
          <div style={{ display: "flex", gap: 10, alignSelf: "center" }}>
            <button
              onClick={prev}
              aria-label="Previous testimonials"
              style={{
                width: 40, height: 40,
                border: "1.5px solid #c8d4d8",
                borderRadius: 6,
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "var(--charcoal)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e8eff3")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonials"
              style={{
                width: 40, height: 40,
                border: "1.5px solid #c8d4d8",
                borderRadius: 6,
                background: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: "var(--charcoal)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#e8eff3")}
              onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards row */}
        <div
          className="testimonials-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            background: "rgba(255,255,255,0.55)",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.07)",
            overflow: "hidden",
            backdropFilter: "blur(6px)",
          }}
        >
          {visible.map((t, i) => (
            <TestimonialCard
              key={`${t.id}-${i}`}
              quote={t.quote}
              author={t.author}
              title={t.title}
              index={i}
            />
          ))}
        </div>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                style={{
                  width: i === page ? 22 : 8, height: 8, borderRadius: 4, padding: 0,
                  background: i === page ? "#3a8fa3" : "#c8d4d8",
                  border: "none", transition: "all 0.3s", cursor: "pointer",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;