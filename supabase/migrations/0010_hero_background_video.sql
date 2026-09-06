-- The hero backdrop is now the site's own video file.
--
-- The field accepts a YouTube link too, but an embed has to have its chrome
-- cropped away and its poster waited out before it looks like a backdrop. An
-- MP4 served from the site autoplays silently on a loop with none of that, so
-- the shipped file is what the hero points at.
--
-- public/media/hero-background.mp4 is deployed with the site, hence the
-- absolute path rather than a storage URL: the media bucket caps files at 2 MB
-- and allows image MIME types only, so a video cannot live there yet.

update public.site_content
set data = jsonb_set(data, '{videoUrl}', '"/media/hero-background.mp4"'::jsonb)
where key = 'hero';
