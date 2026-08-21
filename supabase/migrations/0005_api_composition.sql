-- 0005_api_composition.sql
-- Adds ingredients, safetyWarning and allergenNote to the read function.
--
-- get_site_data() is replaced whole rather than patched: it is one statement
-- that defines the entire public contract, and a partial edit is how the
-- returned shape and src/data/types.ts drift apart.

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

    if coalesce(auth.role(), '') <> 'authenticated' and sections ? 'testimonials' then
        sections := jsonb_set(sections, '{testimonials,items}', coalesce((
            select jsonb_agg(item)
            from jsonb_array_elements(sections -> 'testimonials' -> 'items') item
            where coalesce((item ->> 'visible')::boolean, false)
        ), '[]'::jsonb));
    end if;

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
