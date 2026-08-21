-- 0006_product_labels.sql
--
-- 1. The headings on the product section and /fragrance become editable.
-- 2. The footer credit stops being editable and moves into the code.
--
-- WHY THE LABELS MOVE IN: they sit directly above safety information --
-- "Composition & Care", "Warning", "Sensitive skin" -- and wording that may
-- have to change for a market or a regulator should not require a deploy.
-- The rest come along because splitting "some headings are editable" is more
-- confusing than either extreme.
--
-- WHY THE CREDIT MOVES OUT: it attributes who built the site. That is not
-- content the site owner maintains, and leaving it editable invites it being
-- changed by accident. A build credit belongs with the build.
--
-- No change to get_site_data() is needed: it aggregates every site_content
-- row by key, so a new row appears in the payload on its own.

insert into public.site_content (key, data)
values ('productLabels', jsonb_build_object(
    'notesTitle',         'The Olfactory Experience',
    'sizeLabel',          'Select Size',
    'specsTitle',         'Details & Specifications',
    'usageTitle',         'How to Wear It',
    'compositionTitle',   'Composition & Care',
    'compositionNote',    'As printed on the bottle',
    'ingredientsLabel',   'Ingredients',
    'warningLabel',       'Warning',
    'sensitiveSkinLabel', 'Sensitive skin'
))
on conflict (key) do nothing;

-- The footer keeps its tagline and hours heading; only the credit leaves.
update public.site_content
set data = data - 'credit'
where key = 'footer';
