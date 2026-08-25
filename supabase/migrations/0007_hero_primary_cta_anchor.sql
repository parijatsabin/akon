-- The hero's primary CTA ("Our Signature") pointed at /fragrance, which routed
-- the visitor away from the homepage and past the buy column to the reference
-- material. The signature product is the next section of the same page, so the
-- button now scrolls to it instead.
--
-- The destination is fixed in Hero.tsx and the admin no longer exposes a Link
-- field for it. This clears the stored href so the row does not keep a route
-- that nothing reads — a stale value there is the kind of thing that gets
-- copied into a new component later and quietly reintroduces the navigation.
--
-- The label is untouched; it is still editable.

update public.site_content
set data = jsonb_set(data, '{ctaPrimary,href}', '"#signature"'::jsonb)
where key = 'hero'
  and data ? 'ctaPrimary';
