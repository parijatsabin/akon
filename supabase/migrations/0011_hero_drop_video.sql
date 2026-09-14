-- The hero backdrop is an image again, managed from the CMS.
--
-- 0010 pointed the hero at a shipped MP4 and the field also took YouTube links.
-- Both paths are gone from the code, so the key comes off the row too: the
-- contract is that `data` matches HeroData in src/data/types.ts exactly.
-- backgroundImage is left as it is; whatever the editor uploads is the hero.

update public.site_content
set data = data - 'videoUrl'
where key = 'hero';
