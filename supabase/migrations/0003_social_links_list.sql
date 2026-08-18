-- 0003_social_links_list.sql
-- Turns company.social from a fixed object into an ordered list.
--
-- BEFORE  {"instagram": "...", "facebook": "...", "pinterest": "..."}
-- AFTER   [{"platform": "instagram", "url": "..."},
--          {"platform": "facebook",  "url": "..."}]
--
-- The object shape meant the set of platforms was fixed by the schema and the
-- TypeScript type: adding one was a migration plus a code change, and removing
-- one left a dead key behind. A list makes it editable in the CMS.
--
-- Pinterest is dropped rather than carried over, as requested — only Instagram
-- and Facebook for now. The URL it held (https://pinterest.com/anok) is
-- recorded here so it can be restored by hand if that was not intended.
--
-- Only entries with a non-empty URL survive: an empty string was previously
-- the way to hide a platform, and in a list the absence of the row says that
-- more clearly.

update public.company
set social = coalesce((
    select jsonb_agg(entry order by ord)
    from (
        values
            ('instagram', social ->> 'instagram', 1),
            ('facebook',  social ->> 'facebook',  2)
    ) as t(platform, url, ord),
    lateral (select jsonb_build_object('platform', platform, 'url', url) as entry) e
    where url is not null and length(trim(url)) > 0
), '[]'::jsonb)
where id;

comment on column public.company.social is
    'Ordered list of {platform, url}. Platforms the site can render are listed in src/components/SocialLinks.tsx; an unknown platform is skipped rather than drawn.';
