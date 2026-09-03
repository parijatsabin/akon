-- 0008_customer_reviews.sql
-- Lets customers submit reviews, and makes the review list a table.
--
-- WHY A TABLE. Testimonials lived inside site_content.testimonials.data.items,
-- a JSON document only admins may write. A public form cannot append to that:
-- anon has no write grant on site_content, and handing it one would give the
-- public a key to every section of the site. Even with access, appending to a
-- document is read-modify-write, so two people submitting in the same moment
-- would silently overwrite each other. Rows do not have that problem.
--
-- Customer reviews and admin-written testimonials are the same thing and live
-- in the same table. What separates them is `visible`: a submission arrives
-- hidden and an admin publishes it with the toggle that already exists.
--
-- The public shape is unchanged. get_site_data() still returns
-- testimonials.items in exactly the form src/data/types.ts describes, so the
-- site's components and its JSON-LD needed no edit for this migration.

-- ── Table ──────────────────────────────────────────────────────
create table public.reviews (
    id         uuid primary key default gen_random_uuid(),
    author     text not null check (length(trim(author)) between 1 and 120),
    -- Role or company, shown under the name. Admin-editable rather than
    -- self-declared: it is the field most likely to be filled with promotion.
    title      text not null default '' check (length(title) <= 120),
    quote      text not null check (length(trim(quote)) between 1 and 1000),
    rating     smallint not null check (rating between 1 and 5),

    -- The submitter's address. NEVER returned by get_site_data() and never
    -- rendered: it exists so staff can recognise and reach a real reviewer.
    -- Null on rows an admin wrote by hand, which is also what tells the two
    -- apart in the CMS without needing a `source` column.
    email      citext check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),

    -- Submissions land hidden. Publishing is the admin's decision, and the
    -- insert policy below is what makes that a rule rather than a convention.
    visible    boolean not null default false,
    -- The default only ever applies to public submissions: the CMS always
    -- writes an explicit position. It is high so a new submission joins the
    -- END of the list in the CMS rather than surfacing between reviews the
    -- owner has already ordered. Saving in the CMS reindexes from zero.
    sort_order integer not null default 1000,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create trigger reviews_set_updated_at
    before update on public.reviews
    for each row execute function public.set_updated_at();

-- Display order, and the CMS list: newest submission last, like the form fills it.
create index reviews_display_idx on public.reviews (sort_order, created_at);
-- One review per address, the same shape as contacts_unique_subscriber. Partial,
-- because admin-written rows carry no email and many of them may coexist.
create unique index reviews_unique_reviewer on public.reviews (email) where email is not null;

-- ── Row level security ─────────────────────────────────────────
-- Modelled on contacts: anyone may submit, only staff may read or change.
alter table public.reviews enable row level security;

-- `visible = false` is the whole guard. A submitter may write a row but cannot
-- publish one, exactly as an enquiry may only be inserted as status = 'new'.
create policy "anyone may submit" on public.reviews
    for insert to anon, authenticated with check (visible = false);
-- No select policy for anon on purpose. The public site reads reviews through
-- get_site_data(), which is SECURITY INVOKER but returns only the shaped,
-- visible rows; direct table reads would expose reviewer emails and the
-- unpublished queue.
create policy "staff read reviews" on public.reviews
    for select to authenticated using ((select public.is_admin()));
create policy "staff update reviews" on public.reviews
    for update to authenticated using ((select public.is_admin()))
    with check ((select public.is_admin()));
create policy "staff delete reviews" on public.reviews
    for delete to authenticated using ((select public.is_admin()));

grant insert on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;

-- ── The projection the site reads ──────────────────────────────
-- SECURITY DEFINER, and this is the reason: anon has no SELECT on reviews at
-- all, by design. get_site_data() runs as its caller, so it cannot read the
-- table on the public's behalf. Rather than open the table to anon — which
-- would expose reviewer emails and the unapproved queue through PostgREST's
-- generated endpoint — the escalation is confined to this one projection,
-- which returns named columns only and never `email`.
--
-- It takes NO arguments on purpose. Staffness is decided inside, from the
-- caller's own JWT; a boolean parameter would let anon ask for the hidden
-- rows simply by passing true.
create or replace function public.testimonial_items()
returns jsonb language sql stable security definer set search_path = ''
as $$
    select coalesce(jsonb_agg(
        jsonb_build_object(
            'id', r.id, 'quote', r.quote, 'author', r.author,
            'title', r.title, 'rating', r.rating,
            'visible', r.visible, 'order', r.sort_order
        )
        order by r.sort_order, r.created_at
    ), '[]'::jsonb)
    from public.reviews r
    where coalesce(auth.role(), '') = 'authenticated' or r.visible;
$$;
grant execute on function public.testimonial_items() to anon, authenticated;

-- ── Move the existing testimonials across ──────────────────────
insert into public.reviews (id, author, title, quote, rating, visible, sort_order, email)
select
    -- Ids are kept so nothing that references one breaks. The pattern test is
    -- not paranoia: TestimonialItem.id is documented as having been a plain
    -- number back when this content lived in a hand-edited JSON file, and a
    -- bare ::uuid cast on one of those would abort the whole migration.
    case when item ->> 'id' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         then (item ->> 'id')::uuid else gen_random_uuid() end,
    item ->> 'author',
    coalesce(item ->> 'title', ''),
    item ->> 'quote',
    least(greatest(coalesce((item ->> 'rating')::smallint, 5), 1), 5),
    coalesce((item ->> 'visible')::boolean, false),
    coalesce((item ->> 'order')::integer, 0),
    null
-- The row is selected in a subquery, and the array is checked inside the
-- LATERAL rather than in a WHERE: a lateral runs before WHERE filters, so
-- reading `items` off every other section — faq has one too — would hand
-- jsonb_array_elements whatever those hold.
from (select data from public.site_content where key = 'testimonials') sc,
     lateral jsonb_array_elements(
         case when jsonb_typeof(sc.data -> 'items') = 'array'
              then sc.data -> 'items' else '[]'::jsonb end
     ) item
where coalesce(trim(item ->> 'author'), '') <> ''
  and coalesce(trim(item ->> 'quote'), '') <> '';

-- The document keeps the section's copy and gives up the list: two stores of
-- the same reviews is how the page and the CMS drift apart.
update public.site_content
set data = data - 'items'
where key = 'testimonials';

-- ── Read function ──────────────────────────────────────────────
-- Replaced whole rather than patched, for the reason given in 0005: it is one
-- statement defining the entire public contract.
create or replace function public.get_site_data()
returns jsonb language plpgsql stable set search_path = ''
as $$
declare
    v_product public.products%rowtype;
    v_company public.company%rowtype;
    sections  jsonb;
begin
    select * into v_company from public.company limit 1;
    if v_company.id is null then
        raise exception 'site data is not seeded: company is empty';
    end if;

    select * into v_product from public.products where is_featured limit 1;
    if v_product.id is null then
        raise exception 'site data is not seeded: no featured product';
    end if;

    select jsonb_object_agg(key, data) into sections from public.site_content;
    sections := coalesce(sections, '{}'::jsonb);

    -- testimonials.items now comes from public.reviews, through the projection
    -- above. The public gets the visible ones; staff get the queue as well,
    -- which is what the CMS lists.
    --
    -- The section document is ensured first: jsonb_set only creates a missing
    -- LEAF, so with no 'testimonials' key at all it would return `sections`
    -- untouched and the site would receive a section with no items array —
    -- which every caller of testimonials.items reads without guarding.
    if not (sections ? 'testimonials') then
        sections := sections || jsonb_build_object('testimonials', '{}'::jsonb);
    end if;
    sections := jsonb_set(sections, '{testimonials,items}', public.testimonial_items(), true);

    return sections || jsonb_build_object(
        'brand', jsonb_build_object(
            'name', v_company.name, 'tagline', v_company.tagline,
            'shortDescription', v_company.short_description, 'location', v_company.location,
            'phone', v_company.phone, 'phoneDisplay', v_company.phone_display,
            'email', v_company.email, 'useDefaultTime', v_company.use_default_time,
            'mapEmbed', v_company.map_embed, 'hours', v_company.hours,
            'socialLinks', v_company.social
        ),
        'featuredProduct', jsonb_build_object(
            'id', v_product.slug, 'name', v_product.name,
            'collection', v_product.collection, 'concentration', v_product.concentration,
            'headlineSize', v_product.headline_size, 'tagline', v_product.tagline,
            'description', v_product.description, 'price', v_product.price,
            'orderingNote', v_product.ordering_note, 'images', v_product.images,
            'sizes', v_product.sizes, 'notes', v_product.notes,
            'highlights', v_product.highlights, 'specs', v_product.specs,
            'usage', v_product.usage,
            -- Composition and safety. See migration 0004.
            'ingredients', v_product.ingredients,
            'safetyWarning', v_product.safety_warning,
            'allergenNote', v_product.allergen_note
        ),
        'media', jsonb_build_object('lqip', coalesce((
            select jsonb_object_agg(m.public_url, m.lqip) from public.media_assets m
            where m.kind = 'object' and m.lqip <> '' and m.public_url is not null
        ), '{}'::jsonb))
    );
end;
$$;
grant execute on function public.get_site_data() to anon, authenticated;
