-- ============================================================
-- Seed: 003_seed_testimonials
-- Description: Seeds the 3 hardcoded testimonials.
--   Uses a truncate+reinsert pattern since testimonials have
--   no natural unique key (quote text can change).
-- ============================================================

-- Truncate and reseed (safe — only run in dev/staging seed step)
TRUNCATE TABLE public.testimonials RESTART IDENTITY;

INSERT INTO public.testimonials (quote, author_name, author_title, rating, sort_order) VALUES
(
    'Noir Elixir is pure magic. The bold, seductive blend is perfect for evenings out, and I always receive compliments on it.',
    'Sophia L.',
    'Ceo Of Alpha Company',
    5, 10
),
(
    'Celestial Blossom is my everyday signature. Light, feminine, and utterly elegant — it lasts all day beautifully.',
    'Amara K.',
    'Head of Design, Bloom Studio',
    5, 20
),
(
    'The packaging alone is a work of art. Mystic Dawn has a depth that I have never experienced in any other fragrance.',
    'James R.',
    'Lifestyle Curator',
    5, 30
);
