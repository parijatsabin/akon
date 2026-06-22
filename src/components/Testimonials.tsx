import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS, BRAND } from "../data/siteContent";

/* Brand wordmark on each card */
const BrandMark: React.FC = () => (
  <div
    style={{
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "1.1rem",
      letterSpacing: "0.18em",
      color: "var(--gold)",
      textTransform: "uppercase",
      userSelect: "none",
      opacity: 0.75,
    }}
  >
    {BRAND.name}
  </div>
);

/* Opening quote glyph — brand gold */
const QuoteMark: React.FC = () => (
  <div
    style={{
      fontSize: "2.8rem",
      lineHeight: 1,
      color: "var(--gold)",
      fontFamily: "Georgia, serif",
      fontWeight: 700,
      marginBottom: 14,
      userSelect: "none",
      opacity: 0.65,
    }}
  >
    "
  </div>
);

/* Star rating */
const Stars: React.FC<{ count: number }> = ({ count }) => (
  <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width="13" height="13"
        viewBox="0 0 24 24"
        fill={i < count ? "var(--gold)" : "none"}
        stroke={i < count ? "var(--gold)" : "var(--border)"}
        strokeWidth="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* Single testimonial card */
interface CardProps {
  quote: string;
  author: string;
  title: string;
  rating: number;
  index?: number;
}

const TestimonialCard: React.FC<CardProps> = ({
  quote, author, title, rating, index = 0,
}) => (
  <div
    style={{
      flex: "1 1 0",
      minWidth: 0,
      background: "transparent",
      padding: "36px 32px 32px",
      display: "flex",
      flexDirection: "column",
      borderLeft:
        index > 0 ? "1px solid var(--border)" : "none",
      transition: "background 0.2s",
    }}
  >
    <QuoteMark />
    <Stars count={rating} />
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.9rem",
        lineHeight: 1.78,
        color: "var(--text-main)",
        marginBottom: 26,
        flexGrow: 1,
        fontStyle: "italic",
      }}
    >
      "{quote}"
    </p>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "var(--text-main)",
            marginBottom: 3,
          }}
        >
          {author}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.76rem",
            color: "var(--text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          {title}
        </div>
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
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );
  while (visible.length < CARDS_PER_PAGE) {
    visible.push(items[visible.length % items.length]);
  }

  return (
    <section
      id="reviews"
      className="section"
      style={{
        background: "var(--warm-white)",
      }}
    >
      <div className="container">

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 44,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="tag">Voices of Trust</span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)",
                fontWeight: 700,
                color: "var(--text-main)",
                lineHeight: 1.15,
              }}
            >
              {TESTIMONIALS.headline}
            </h2>
          </div>

          {/* Navigation arrows */}
          <div style={{ display: "flex", gap: 10, alignSelf: "center" }}>
            <button
              onClick={prev}
              aria-label="Previous testimonials"
              style={{
                width: 42, height: 42,
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-main)",
                transition: "all 0.22s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-main)";
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Next testimonials"
              style={{
                width: 42, height: 42,
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-main)",
                transition: "all 0.22s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--gold)";
                e.currentTarget.style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-main)";
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div
          className="testimonials-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 0,
            background: "#fff",
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}
        >
          {visible.map((t, i) => (
            <TestimonialCard
              key={`${t.id}-${i}`}
              quote={t.quote}
              author={t.author}
              title={t.title}
              rating={t.rating}
              index={i}
            />
          ))}
        </div>

        {/* Dots */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 30,
            }}
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
                style={{
                  width: i === page ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  padding: 0,
                  background: i === page ? "var(--gold)" : "var(--border)",
                  border: "none",
                  transition: "all 0.32s",
                  cursor: "pointer",
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
