-- ============================================================
-- Seed: 001_seed_site_content
-- Description: Migrates the current hardcoded siteContent.ts
--   data into the site_content table.
--   Safe to run multiple times (ON CONFLICT DO UPDATE).
-- ============================================================

INSERT INTO public.site_content (section, content) VALUES

('brand', '{
  "name": "ANOK",
  "tagline": "Where luxury meets the art of fragrance",
  "shortDescription": "ANOK is a Kathmandu-born house of fragrance — composing rare, slow-crafted perfumes that hold time, memory and the quiet weight of luxury.",
  "location": "Maharajgunj Chakrapath, Kathmandu, Nepal",
  "phone": "+977 9868765432",
  "phoneDisplay": "+977 9868 765 432",
  "email": "hello@anok.fragrance",
  "useDefaultTime": true,
  "hours": [
    {"day":"Sunday","isClosed":true,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Monday","isClosed":false,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Tuesday","isClosed":false,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Wednesday","isClosed":false,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Thursday","isClosed":false,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Friday","isClosed":false,"openTime":"09:00","closeTime":"17:00"},
    {"day":"Saturday","isClosed":false,"openTime":"09:00","closeTime":"17:00"}
  ],
  "socialLinks": {
    "instagram": "https://instagram.com/anok",
    "facebook": "https://facebook.com/anok",
    "pinterest": "https://pinterest.com/anok"
  },
  "mapEmbed": "https://www.google.com/maps?q=Maharajgunj+Chakrapath,+Kathmandu,+Nepal&output=embed"
}'::JSONB),

('hero', '{
  "smallLabel": "LUXURY &",
  "smallLabelHighlight": "PREMIUM",
  "mainHeading": "Revel The Beauty\nInside You",
  "description": "Timeless Fragrances, Crafted With Passion, Embody Individuality, Elegance, And Sophistication, Leaving A Lasting Impression Always.",
  "ctaPrimary": {"label": "Explore Collection", "href": "#collection"},
  "ctaSecondary": {"label": "Our Story", "href": "#about"}
}'::JSONB),

('stats', '[
  {"value": "140+", "label": "Products Available"},
  {"value": "1M+",  "label": "Sales Already"},
  {"value": "80+",  "label": "Industrial Franchises"},
  {"value": "1.01m","label": "Connections"}
]'::JSONB),

('about', '{
  "sectionLabel": "\"Our Legacy Of Luxury\"",
  "headline": "About Us",
  "body": "ANOK is a Kathmandu-born house of fragrance — composing rare, slow-crafted perfumes that hold time, memory and the quiet weight of luxury.",
  "cta": {"label": "Learn More", "href": "#contact"},
  "whyHeadline": "Why Choose Us",
  "whyTagline": "Luxury redefined—crafted for the exceptional.",
  "reasons": [
    {"id": "01", "title": "Artistic Design",       "body": "Every fragrance is a masterpiece, crafted with precision by world-class perfumers."},
    {"id": "02", "title": "Organic Ingredients",   "body": "Sourced from nature'\''s finest, each note embodies pure sophistication."},
    {"id": "03", "title": "Sustainable Elegance",  "body": "Indulge guilt-free with fragrances designed to honour the planet."},
    {"id": "04", "title": "Exclusive Collections", "body": "Discover scents as rare and unique as the moments they inspire."}
  ]
}'::JSONB),

('commitment', '{
  "headline": "A Commitment To Purity",
  "body": "We believe in sustainable luxury. Every bottle of ANOK is crafted with responsibly sourced ingredients, ensuring a lasting impact on you—not on the environment.",
  "cta": {"label": "Learn More", "href": "#about"}
}'::JSONB),

('newsletter', '{
  "headline": "Stay Connected with",
  "brandHighlight": "ANOK",
  "subtext": "Receive exclusive offers, early access to new fragrance launches, invitations to special events.",
  "placeholder": "Enter your email",
  "cta": "Subscribe Now"
}'::JSONB),

('navigation', '[
  {"label": "Home",       "href": "#home"},
  {"label": "Collection", "href": "#collection"},
  {"label": "Reviews",    "href": "#reviews"},
  {"label": "Contact",    "href": "#contact"}
]'::JSONB),

('footer', '{
  "tagline": "Refresh Your Senses With Exclusive Fragrances, Product Launches, And Special Offers Delivered To Your Inbox.",
  "navColumns": [
    {
      "heading": "Shop",
      "links": [
        {"label": "Signature Collection", "href": "#collection"},
        {"label": "Luxury Collection",    "href": "#collection"},
        {"label": "Limited Editions",     "href": "#collection"},
        {"label": "Seasonal Fragrances",  "href": "#collection"}
      ]
    },
    {
      "heading": "Support",
      "links": [
        {"label": "FAQs",           "href": "#"},
        {"label": "Shipping",       "href": "#"},
        {"label": "Returns",        "href": "#"},
        {"label": "Privacy Policy", "href": "#"},
        {"label": "Terms of Use",   "href": "#"}
      ]
    },
    {
      "heading": "Extras",
      "links": [
        {"label": "Fragrance Guide", "href": "#"},
        {"label": "Look Book",       "href": "#"},
        {"label": "Gift Sets",       "href": "#"}
      ]
    }
  ],
  "credit": {"label": "AbionSoft", "href": "#"}
}'::JSONB)

ON CONFLICT (section) DO UPDATE
    SET content    = EXCLUDED.content,
        updated_at = NOW();
