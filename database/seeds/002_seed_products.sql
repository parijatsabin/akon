-- ============================================================
-- Seed: 002_seed_products
-- Description: Seeds all 8 products from the original
--   siteContent.ts / cms.defaults.ts hardcoded array.
--   Prices converted from display strings to integer NPR.
--   Safe to re-run (ON CONFLICT DO UPDATE on slug).
-- ============================================================

INSERT INTO public.products
    (slug, name, collection, description, price_npr, badge, accent_color, image_url, product_url, notes_top, notes_heart, notes_base, sort_order)
VALUES

(
    'noir-veil', 'Noir Veil', 'Signature Collection',
    'A nocturnal composition built on aged oud and Bulgarian rose — quiet, deliberate, unmistakably ANOK.',
    24500, NULL, '#1a1a1a',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop',
    '#',
    ARRAY['Bergamot', 'Pink Pepper'],
    ARRAY['Bulgarian Rose', 'Iris'],
    ARRAY['Oud', 'Amber'],
    10
),
(
    'espresso-rouge', 'Espresso Rouge', 'Luxury Collection',
    'Velvety espresso wrapped in vanilla and cashmere woods — gourmand without sweetness.',
    28900, 'Best Seller', '#3d2817',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=500&fit=crop',
    '#',
    ARRAY['Roasted Coffee', 'Cardamom'],
    ARRAY['Tonka', 'Cocoa Absolute'],
    ARRAY['Vanilla', 'Cashmeran'],
    20
),
(
    'champagne-hour', 'Champagne Hour', 'Signature Collection',
    'Effervescent jasmine and peach over white musk — the held breath before a celebration.',
    22000, NULL, '#f9e4e4',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop',
    '#',
    ARRAY['Champagne Accord', 'Mandarin'],
    ARRAY['Jasmine Sambac', 'Peach'],
    ARRAY['White Musk', 'Sandalwood'],
    30
),
(
    'obsidian-no-7', 'Obsidian No. 7', 'Limited Edition',
    'Smoked leather and vetiver in a faceted obsidian flacon. Numbered to 250 worldwide.',
    42000, 'Limited Edition', '#222222',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=500&fit=crop',
    '#',
    ARRAY['Black Pepper', 'Saffron'],
    ARRAY['Leather', 'Smoked Iris'],
    ARRAY['Vetiver', 'Patchouli'],
    40
),
(
    'kathmandu-bloom', 'Kathmandu Bloom', 'Seasonal Fragrances',
    'A spring ode to the valley in bloom — luminous florals over the cool of mountain cedar.',
    19800, NULL, '#e4f0f5',
    'https://images.unsplash.com/photo-1588405748880-42d3054a1d71?w=400&h=500&fit=crop',
    '#',
    ARRAY['Himalayan Rhododendron', 'Yuzu'],
    ARRAY['Magnolia', 'Lotus'],
    ARRAY['White Tea', 'Cedarwood'],
    50
),
(
    'solar-amber', 'Solar Amber', 'Luxury Collection',
    'Sun-warmed amber and honey suspended in neroli — golden, generous, slow to fade.',
    26400, NULL, '#f5e6c8',
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop',
    '#',
    ARRAY['Neroli', 'Bitter Orange'],
    ARRAY['Honey', 'Beeswax Absolute'],
    ARRAY['Labdanum', 'Benzoin'],
    60
),
(
    'wild-iris', 'Wild Iris', 'Signature Collection',
    'A fresh and elegant blend of wild iris and delicate jasmine.',
    21500, NULL, '#e0d5f0',
    'https://images.unsplash.com/photo-1589733958979-162305875470?w=400&h=500&fit=crop',
    '#',
    ARRAY['Violet Leaf', 'Pear'],
    ARRAY['Iris', 'Jasmine'],
    ARRAY['Musk', 'Cedar'],
    70
),
(
    'coastal-breeze', 'Coastal Breeze', 'Seasonal Fragrances',
    'A refreshing scent inspired by ocean breezes and sun-warmed driftwood.',
    18900, NULL, '#d4e8f5',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=500&fit=crop',
    '#',
    ARRAY['Sea Salt', 'Citrus'],
    ARRAY['Lavender', 'Geranium'],
    ARRAY['Driftwood', 'Amber'],
    80
)

ON CONFLICT (slug) DO UPDATE
    SET name        = EXCLUDED.name,
        collection  = EXCLUDED.collection,
        description = EXCLUDED.description,
        price_npr   = EXCLUDED.price_npr,
        badge       = EXCLUDED.badge,
        accent_color= EXCLUDED.accent_color,
        image_url   = EXCLUDED.image_url,
        notes_top   = EXCLUDED.notes_top,
        notes_heart = EXCLUDED.notes_heart,
        notes_base  = EXCLUDED.notes_base,
        sort_order  = EXCLUDED.sort_order,
        updated_at  = NOW();
