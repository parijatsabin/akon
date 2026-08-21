-- 0004_product_composition.sql
-- Ingredients, the safety warning, and the sensitive-skin guidance.
--
-- WHY THESE BELONG IN THE DATABASE: a formulation changes between batches, and
-- the ingredient list is the part customers with allergies actually read.
-- Hardcoding it would mean a deploy every time the blend is adjusted, which is
-- how printed and published lists drift apart.
--
-- Seven of the eleven ingredients below -- limonene, linalool, citral,
-- geraniol, citronellol, eugenol and benzyl benzoate -- are on the EU list of
-- 26 declarable fragrance allergens. They are declared precisely because they
-- are recognised sensitisers, which is why the patch-test guidance sits beside
-- them on the site rather than in a legal page.
--
-- Deliberately NOT changed: the fragrance notes and the concentration. The
-- printed label describes mountain juniper and 31%, while the site lists
-- bergamot/orchid/vanilla and Eau de Parfum. The site is treated as current
-- and the label as an older print run.

alter table public.products
    add column ingredients    jsonb not null default '[]'::jsonb,
    add column safety_warning text  not null default '',
    add column allergen_note  text  not null default '';

comment on column public.products.ingredients is
    'INCI list, in the order printed on the label. Declarable fragrance allergens are included here, not separated out.';

update public.products
set ingredients = '[
        "Alcohol Denat.",
        "Parfum (Fragrance)",
        "Aqua",
        "Ascorbic Acid",
        "Limonene",
        "Linalool",
        "Citral",
        "Geraniol",
        "Citronellol",
        "Eugenol",
        "Benzyl Benzoate"
    ]'::jsonb,
    safety_warning = 'Flammable. For external use only. Avoid contact with eyes.',
    allergen_note = 'Every individual''s skin chemistry is unique. While our formulation strictly complies with global cosmetic safety standards, it features natural components derived from pure essential oils. If you have sensitive skin or a history of allergies, we kindly suggest conducting a patch test on a small, discreet area before regular application. Should any irritation occur, please discontinue use immediately.'
where is_featured;

-- ── Patch testing joins the wearing instructions ──────────────
-- Guidance belongs where people already look for guidance, and putting it
-- first makes it read as ordinary practice rather than a warning bolted on.
update public.products
set usage = jsonb_build_array(
        jsonb_build_object(
            'id', 'u0',
            'title', 'Patch Test First',
            'body', 'If your skin is sensitive or you have reacted to fragrance before, apply a small amount to the inner arm and leave it for 24 hours before wearing it properly. It costs a day and saves a great deal.'
        )
    ) || usage
where is_featured
  and not exists (
      select 1 from jsonb_array_elements(usage) u where u ->> 'id' = 'u0'
  );

-- ── FAQ ───────────────────────────────────────────────────────
-- Placed directly after "Are your ingredients natural?", where someone already
-- thinking about what is in the bottle will meet it.
update public.site_content
set data = jsonb_set(
        data,
        '{items}',
        (
            select jsonb_agg(item order by ord)
            from (
                select item, ord
                from jsonb_array_elements(data -> 'items') with ordinality as t(item, ord)
                union all
                select jsonb_build_object(
                    'id', 'f-sensitive-skin',
                    'question', 'I have sensitive skin — can I wear this?',
                    'answer', 'Probably, but test it first. ANOK Solar Shadow is built on natural essential oils, and several of the compounds they contain — limonene, linalool, geraniol and others — are common enough sensitisers that they are declared by name on the bottle. Most people wear them without any trouble. If your skin is reactive, or you have reacted to a fragrance before, put a little on the inside of your arm and leave it a day before wearing it properly. Stop using it if any irritation appears. The full ingredient list is published on this site and printed on every bottle.'
                ),
                    (select max(ord) + 0.5
                     from jsonb_array_elements(data -> 'items') with ordinality as x(item, ord)
                     where item ->> 'id' = 'f7')
            ) s
        )
    )
where key = 'faq'
  and not exists (
      select 1 from jsonb_array_elements(data -> 'items') i
      where i ->> 'id' = 'f-sensitive-skin'
  );
