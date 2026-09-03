-- 0009_staff_may_write_reviews.sql
-- Fixes: "new row violates row-level security policy for table reviews",
-- raised by the CMS when saving testimonials.
--
-- 0008 gave public.reviews three staff policies — select, update, delete — and
-- one insert policy, "anyone may submit", carrying `with check (visible =
-- false)`. That policy is granted to anon AND authenticated, and it was the
-- only INSERT policy on the table. So an admin adding a review, or saving a
-- list containing any published one, was checked against the rule written for
-- strangers and rejected.
--
-- It is an INSERT problem even when nothing is being created: the CMS saves
-- the list with an upsert, and PostgREST spells that INSERT ... ON CONFLICT DO
-- UPDATE. Postgres applies the INSERT WITH CHECK to every row of such a
-- statement, including the ones that resolve to an update, which is why the
-- failure hit every save rather than only new rows.
--
-- Policies of the same command are OR'd, so adding this leaves the public path
-- untouched: a stranger still passes only through "anyone may submit" and
-- still cannot publish. What changes is that a staff session now has a second
-- door, and that one is gated on is_admin() rather than on visible.

create policy "staff write reviews" on public.reviews
    for insert to authenticated with check ((select public.is_admin()));
