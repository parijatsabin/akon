-- 0002_realtime_contacts.sql
-- Streams new enquiries to the CMS the moment they are submitted.
--
-- Realtime only forwards changes for tables added to the supabase_realtime
-- publication. Without this the admin would keep polling, or worse, only find
-- out about an enquiry when someone happened to reload the Inbox.
--
-- SECURITY: Realtime applies RLS to every subscriber before delivering a row.
-- The "staff read contacts" policy already restricts SELECT to is_admin(), so
-- an anonymous listener subscribing to this channel receives nothing. That is
-- worth stating explicitly because it is the whole reason this is safe to
-- broadcast: the contents of a customer enquiry go only to staff sessions.
--
-- REPLICA IDENTITY FULL so the payload carries the whole row rather than just
-- the primary key. The notification shows the sender's name and subject, and
-- fetching them separately would be a second round trip per enquiry.

alter table public.contacts replica identity full;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'contacts'
    ) then
        alter publication supabase_realtime add table public.contacts;
    end if;
end;
$$;
