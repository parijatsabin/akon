-- 0001_initial.sql
-- The complete ANOK schema. This is the baseline: nine incremental migrations
-- were squashed into it once the design settled, so what follows is the final
-- state rather than the path taken to reach it.
--
--   site_content   one row per page section, `data` shaped like SiteData
--   company        brand identity, opening hours, social links
--   products       typed scalars + jsonb lists
--   contacts       enquiries and newsletter signups, split by `kind`
--   media_assets   images, size-tiered between base64 and Storage
--   profiles       CMS accounts and roles
--
-- DESIGN NOTE — why jsonb and not thirty tables. Nothing ever queries *inside*
-- the content. get_site_data() returns the whole document, every time, and it
-- is the only read path there is. A fully normalised schema would be paying
-- for query flexibility that is never exercised. What that costs is per-row
-- CHECKs on list items, and foreign keys on images; the second is handled by
-- guard_media_in_use() below.
--
-- Navigation is deliberately absent: the navbar and footer links point at
-- fixed routes and live in Navbar.tsx / Footer.tsx.

-- ══════════════════════════════════════════════════════════════
-- 1. Extensions and shared helpers
-- ══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive username / email

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- True when the statement arrives through PostgREST as anon or a logged-in
-- user. False for the service-role key, for psql, and for migration runs — so
-- the bootstrap script can do what the CMS cannot.
create or replace function public.is_api_caller()
returns boolean
language sql
stable
set search_path = ''
as $$
    select coalesce(auth.role(), '') in ('anon', 'authenticated');
$$;

-- ══════════════════════════════════════════════════════════════
-- 2. Identity and roles
-- ══════════════════════════════════════════════════════════════
-- The CMS shows a username/password form. Supabase Auth is email-based, so a
-- username maps to a synthetic address <username>@auth.anok.local that
-- receives no mail. The real username lives here, unique.

create type public.app_role as enum ('superadmin', 'admin');

create table public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    username    citext not null unique check (length(username) >= 3),
    full_name   text not null default '',
    role        public.app_role not null default 'admin',
    is_active   boolean not null default true,
    created_by  uuid references public.profiles(id) on delete set null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index profiles_active_role_idx on public.profiles (role) where is_active;
create index profiles_created_by_idx  on public.profiles (created_by);

create trigger profiles_set_updated_at
    before update on public.profiles
    for each row execute function public.set_updated_at();

-- SECURITY DEFINER so RLS policies can call these without recursing into
-- profiles' own policies. Policies always call them as `(select is_admin())`
-- so Postgres evaluates once per query rather than once per row.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.is_active
    );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.profiles p
        where p.id = (select auth.uid()) and p.is_active and p.role = 'superadmin'
    );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, username, full_name)
    values (
        new.id,
        coalesce(nullif(new.raw_user_meta_data ->> 'username', ''),
                 split_part(new.email, '@', 1)),
        coalesce(new.raw_user_meta_data ->> 'full_name', '')
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- The role matrix, enforced in the database rather than only in the UI:
--   1. No API caller may mint a superadmin. Bootstrap only.
--   2. Nobody may change their own role or active flag.
--   3. The last active superadmin cannot be demoted or deactivated.
create or replace function public.guard_profile_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    other_superadmins int;
begin
    if new.role = 'superadmin'
       and public.is_api_caller()
       and (tg_op = 'INSERT' or old.role is distinct from new.role)
    then
        raise exception 'superadmin accounts can only be created by the bootstrap process'
            using errcode = '42501';
    end if;

    if tg_op = 'UPDATE' then
        if new.id = (select auth.uid())
           and (new.role is distinct from old.role
                or new.is_active is distinct from old.is_active)
        then
            raise exception 'you cannot change your own role or active status'
                using errcode = '42501';
        end if;

        if old.role = 'superadmin' and old.is_active
           and (new.role <> 'superadmin' or not new.is_active)
        then
            select count(*) into other_superadmins
            from public.profiles
            where role = 'superadmin' and is_active and id <> old.id;

            if other_superadmins = 0 then
                raise exception 'cannot demote or deactivate the last active superadmin'
                    using errcode = '42501';
            end if;
        end if;
    end if;

    return new;
end;
$$;

create trigger profiles_guard_write
    before insert or update on public.profiles
    for each row execute function public.guard_profile_write();

create or replace function public.guard_last_superadmin_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if (select count(*) from public.profiles
        where role = 'superadmin' and is_active and id <> old.id) = 0
    then
        raise exception 'cannot delete the last active superadmin' using errcode = '42501';
    end if;
    return old;
end;
$$;

create trigger profiles_guard_last_superadmin
    before delete on public.profiles
    for each row
    when (old.role = 'superadmin' and old.is_active)
    execute function public.guard_last_superadmin_delete();

-- ══════════════════════════════════════════════════════════════
-- 3. Media
-- ══════════════════════════════════════════════════════════════
-- Assets <= 8 KB are stored as base64 `data:` text and resolve inline, saving
-- an HTTP round trip. Larger assets go to Storage with an immutable cache
-- header, plus a ~600-byte base64 LQIP blur for instant paint. Base64 is 33%
-- larger than the bytes it encodes and cannot be cached separately from the
-- content document, so it is used only where a round trip costs more than the
-- bytes. The constraints below are what keep that true over time — a
-- convention enforced only by the upload script is not enforced.
--
-- The 8 KB threshold was tuned down from 20 KB after measurement: a 13.6 KB
-- image became 18 KB of base64 and pushed the blocking payload to 58.9 KB.

create type public.media_kind as enum ('inline', 'object');

create table public.media_assets (
    id           uuid primary key default gen_random_uuid(),
    kind         public.media_kind not null,
    filename     text not null,
    mime_type    text not null check (mime_type in
                     ('image/webp', 'image/png', 'image/jpeg', 'image/svg+xml')),
    bytes        int not null check (bytes > 0),   -- decoded size, not base64
    width        int not null default 0,
    height       int not null default 0,
    alt          text not null default '',
    checksum     text not null unique,             -- sha256, dedupe key
    data_url     text,          -- kind='inline'
    storage_path text,          -- kind='object'
    public_url   text,          -- kind='object'
    lqip         text not null default '',
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now(),
    updated_by   uuid references public.profiles(id) on delete set null,

    constraint tier_consistent check (
        (kind = 'inline' and data_url is not null
                         and storage_path is null and public_url is null)
        or
        (kind = 'object' and data_url is null
                         and storage_path is not null and public_url is not null)
    ),
    -- 8 KB of image -> ~10.9 KB of base64. Mirrors INLINE_MAX_BYTES in
    -- scripts/lib/env.ts; change both together.
    constraint inline_is_small check (
        data_url is null or octet_length(data_url) <= 12000
    )
);

create index media_assets_kind_idx       on public.media_assets (kind);
create index media_assets_updated_by_idx on public.media_assets (updated_by);

create trigger media_assets_set_updated_at
    before update on public.media_assets
    for each row execute function public.set_updated_at();

-- Without this the inline tier degrades into base64-everything one upload at
-- a time, and nobody notices until the site is slow.
create or replace function public.guard_inline_media_ceiling()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
    others_bytes bigint;
    ceiling_bytes constant bigint := 200000;
begin
    if new.data_url is null then return new; end if;

    select coalesce(sum(octet_length(data_url)), 0) into others_bytes
    from public.media_assets
    where data_url is not null and id <> new.id;

    if others_bytes + octet_length(new.data_url) > ceiling_bytes then
        raise exception
            'inline media ceiling exceeded: % bytes already inline, this asset adds %, limit is %. Store this asset in Storage instead.',
            others_bytes, octet_length(new.data_url), ceiling_bytes
            using errcode = 'check_violation';
    end if;
    return new;
end;
$$;

create trigger media_assets_guard_ceiling
    before insert or update on public.media_assets
    for each row execute function public.guard_inline_media_ceiling();

-- Bucket is public so the browser and CDN can cache objects — that caching is
-- the whole performance argument for the object tier.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152,
        array['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'])
on conflict (id) do update
set public             = excluded.public,
    file_size_limit    = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "media objects are publicly readable"
    on storage.objects for select to public
    using (bucket_id = 'media');

create policy "admins upload media"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'media' and (select public.is_admin()));

create policy "admins update media"
    on storage.objects for update to authenticated
    using (bucket_id = 'media' and (select public.is_admin()))
    with check (bucket_id = 'media' and (select public.is_admin()));

create policy "admins delete media"
    on storage.objects for delete to authenticated
    using (bucket_id = 'media' and (select public.is_admin()));

-- ══════════════════════════════════════════════════════════════
-- 4. Content
-- ══════════════════════════════════════════════════════════════

create table public.site_content (
    key        text primary key,
    data       jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    updated_by uuid references public.profiles(id) on delete set null
);

create index site_content_updated_by_idx on public.site_content (updated_by);

create trigger site_content_set_updated_at
    before update on public.site_content
    for each row execute function public.set_updated_at();

comment on table public.site_content is
    'One row per page section. `data` matches the section shape in src/data/types.ts exactly, so the CMS saves a section with a single upsert. Keys: hero, about, testimonials, commitment, newsletter, footer, contact, seo, faq, privacy, terms.';

create table public.company (
    id                boolean primary key default true check (id),
    name              text not null default '',
    tagline           text not null default '',
    short_description text not null default '',
    location          text not null default '',
    phone             text not null default '',
    phone_display     text not null default '',
    email             text not null default '',
    use_default_time  boolean not null default false,
    map_embed         text not null default '',
    hours             jsonb not null default '[]'::jsonb,   -- [{day,isClosed,openTime,closeTime}]
    social            jsonb not null default '{}'::jsonb,   -- {instagram,facebook,pinterest}
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now(),
    updated_by        uuid references public.profiles(id) on delete set null
);

create index company_updated_by_idx on public.company (updated_by);

create trigger company_set_updated_at
    before update on public.company
    for each row execute function public.set_updated_at();

-- A table with an is_featured flag rather than a singleton, so V2 can add
-- products without a schema migration.
create table public.products (
    id            uuid primary key default gen_random_uuid(),
    slug          text not null unique,
    name          text not null default '',
    collection    text not null default '',
    concentration text not null default '',
    headline_size text not null default '',
    tagline       text not null default '',
    description   text not null default '',
    price         text not null default '',
    ordering_note text not null default '',
    is_featured   boolean not null default false,
    images        jsonb not null default '[]'::jsonb,   -- resolved src strings
    sizes         jsonb not null default '[]'::jsonb,
    notes         jsonb not null default '{}'::jsonb,   -- {top,heart,base}
    highlights    jsonb not null default '[]'::jsonb,
    specs         jsonb not null default '[]'::jsonb,
    usage         jsonb not null default '[]'::jsonb,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    updated_by    uuid references public.profiles(id) on delete set null
);

-- Every row reaching this partial index has is_featured = true, so uniqueness
-- on that column allows exactly one.
create unique index products_single_featured_idx
    on public.products (is_featured) where is_featured;
create index products_updated_by_idx on public.products (updated_by);

create trigger products_set_updated_at
    before update on public.products
    for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 5. Contacts
-- ══════════════════════════════════════════════════════════════
-- Enquiries and newsletter signups share a table, separated by `kind`. The
-- columns an enquiry needs are nullable so a signup can omit them, and a CHECK
-- enforces the per-kind requirements that NOT NULL no longer can.

create type public.submission_status as enum ('new', 'read', 'archived');
create type public.contact_kind      as enum ('enquiry', 'newsletter');

create table public.contacts (
    id         uuid primary key default gen_random_uuid(),
    kind       public.contact_kind not null,
    name       text,
    email      citext not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
    subject    text not null default '' check (length(subject) <= 200),
    message    text,
    status     public.submission_status not null default 'new',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint enquiry_needs_name_and_message check (
        kind <> 'enquiry' or (
            name is not null and length(trim(name)) between 1 and 200
            and message is not null and length(trim(message)) between 1 and 5000
        )
    )
);

-- One subscription per address; enquiries may repeat freely. A partial unique
-- index expresses exactly that, which a plain UNIQUE could not.
create unique index contacts_unique_subscriber
    on public.contacts (email) where kind = 'newsletter';
create index contacts_kind_created_idx on public.contacts (kind, created_at desc);
create index contacts_status_idx on public.contacts (status, created_at desc)
    where kind = 'enquiry';

create trigger contacts_set_updated_at
    before update on public.contacts
    for each row execute function public.set_updated_at();

-- ══════════════════════════════════════════════════════════════
-- 6. Media integrity
-- ══════════════════════════════════════════════════════════════
-- Images inside jsonb are plain URLs, not foreign keys, so deleting an asset
-- would leave a dangling link and a broken image with nothing to catch it.
-- This restores the FK's protection from the other side: refuse the delete
-- rather than null the reference.

create or replace function public.guard_media_in_use()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    ref text := coalesce(old.public_url, old.data_url, '');
    used_by text;
begin
    if ref = '' then return old; end if;

    -- position(), not LIKE: a base64 data URL can contain '_' and '%', which
    -- LIKE would treat as wildcards and match far too much.
    select string_agg(src, ', ') into used_by from (
        select 'site_content[' || key || ']' as src
        from public.site_content where position(ref in data::text) > 0
        union all
        select 'product ' || slug
        from public.products where position(ref in images::text) > 0
    ) s;

    if used_by is not null then
        raise exception 'cannot delete this asset: still used by %. Clear the field first.', used_by
            using errcode = '23503';
    end if;
    return old;
end;
$$;

create trigger media_assets_guard_in_use
    before delete on public.media_assets
    for each row execute function public.guard_media_in_use();

-- Shown by the CMS before allowing a delete, so an editor can see what breaks.
create view public.media_asset_usage
with (security_invoker = on) as
select m.id as media_id,
       coalesce((
           select array_agg(src) from (
               select 'site_content[' || sc.key || ']' as src
               from public.site_content sc
               where position(coalesce(m.public_url, m.data_url, '') in sc.data::text) > 0
               union all
               select 'product ' || p.slug
               from public.products p
               where position(coalesce(m.public_url, m.data_url, '') in p.images::text) > 0
           ) s
       ), '{}'::text[]) as used_in
from public.media_assets m;

-- ══════════════════════════════════════════════════════════════
-- 7. Security — grants and RLS
-- ══════════════════════════════════════════════════════════════
-- Two gates, both required:
--     GRANT  -> may this role touch this table at all?
--     RLS    -> which rows, and under what conditions?
-- Tables created by a migration carry NO privileges for anon / authenticated,
-- so without the grants every policy below is unreachable and every query
-- fails with "permission denied for table ..." — which looks nothing like a
-- policy error and sends you hunting in the wrong file.
--
-- Write policies are split into INSERT / UPDATE / DELETE rather than FOR ALL:
-- FOR ALL also covers SELECT, which would stack a second permissive policy on
-- every read and double the policy evaluations.

grant usage on schema public to anon, authenticated, service_role;

-- ── Public content: anyone reads, admins write ────────────────
alter table public.site_content  enable row level security;
alter table public.company       enable row level security;
alter table public.products      enable row level security;
alter table public.media_assets  enable row level security;

do $$
declare t text;
begin
    foreach t in array array['site_content', 'products', 'media_assets'] loop
        execute format(
            'create policy "public read" on public.%I
                 for select to anon, authenticated using (true)', t);
        execute format(
            'create policy "admin insert" on public.%I
                 for insert to authenticated with check ((select public.is_admin()))', t);
        execute format(
            'create policy "admin update" on public.%I
                 for update to authenticated using ((select public.is_admin()))
                 with check ((select public.is_admin()))', t);
        execute format(
            'create policy "admin delete" on public.%I
                 for delete to authenticated using ((select public.is_admin()))', t);

        execute format('grant select on public.%I to anon, authenticated', t);
        execute format('grant insert, update, delete on public.%I to authenticated', t);
    end loop;
end;
$$;

-- Exactly one company row exists, so it is never inserted or deleted.
create policy "public read" on public.company
    for select to anon, authenticated using (true);
create policy "admin update" on public.company
    for update to authenticated using ((select public.is_admin()))
    with check ((select public.is_admin()));

grant select on public.company to anon, authenticated;
grant update on public.company to authenticated;
grant select on public.media_asset_usage to authenticated;

-- ── Profiles: staff read, superadmin manages ──────────────────
alter table public.profiles enable row level security;

-- No anon policy and no anon grant: the user list is not public at either the
-- privilege level or the policy level.
create policy "staff read profiles" on public.profiles
    for select to authenticated using ((select public.is_admin()));

-- You may write a profile row if it is yours, or if you are a superadmin. The
-- guard trigger blocks changing your own role or is_active, so "edit your own"
-- cannot become self-escalation.
create policy "update own profile or any as superadmin" on public.profiles
    for update to authenticated
    using (id = (select auth.uid()) or (select public.is_superadmin()))
    with check (id = (select auth.uid()) or (select public.is_superadmin()));

create policy "superadmin creates profiles" on public.profiles
    for insert to authenticated with check ((select public.is_superadmin()));
create policy "superadmin deletes profiles" on public.profiles
    for delete to authenticated using ((select public.is_superadmin()));

grant select, insert, update, delete on public.profiles to authenticated;

-- ── Contacts: the public may submit, and nothing else ─────────
-- Denied at both the privilege and policy level: a readable customer list is
-- the worst failure mode here, so one mistake should not be enough to expose
-- it. WITH CHECK pins status so a bot cannot insert rows that look handled.
alter table public.contacts enable row level security;

create policy "anyone may submit" on public.contacts
    for insert to anon, authenticated with check (status = 'new');
create policy "staff read contacts" on public.contacts
    for select to authenticated using ((select public.is_admin()));
create policy "staff update contacts" on public.contacts
    for update to authenticated using ((select public.is_admin()))
    with check ((select public.is_admin()));
create policy "staff delete contacts" on public.contacts
    for delete to authenticated using ((select public.is_admin()));

grant insert on public.contacts to anon;
grant select, insert, update, delete on public.contacts to authenticated;

-- ── Function privileges ───────────────────────────────────────
-- PostgREST exposes every function in `public` at /rest/v1/rpc/<name>. Trigger
-- functions are SECURITY DEFINER and exist only to be fired by triggers, so
-- nothing should be able to call them directly. Revoking EXECUTE does not
-- affect the triggers: Postgres checks that privilege when the trigger is
-- created, not when the statement runs.
revoke execute on function public.set_updated_at()               from public, anon, authenticated;
revoke execute on function public.handle_new_user()              from public, anon, authenticated;
revoke execute on function public.guard_profile_write()          from public, anon, authenticated;
revoke execute on function public.guard_last_superadmin_delete() from public, anon, authenticated;
revoke execute on function public.guard_inline_media_ceiling()   from public, anon, authenticated;
revoke execute on function public.guard_media_in_use()           from public, anon, authenticated;
revoke execute on function public.is_api_caller()                from public, anon, authenticated;

-- anon has no use for these and gets no reach it does not need.
revoke execute on function public.is_admin()      from public, anon;
revoke execute on function public.is_superadmin() from public, anon;
grant  execute on function public.is_admin()      to authenticated;
grant  execute on function public.is_superadmin() to authenticated;

grant all privileges on all tables    in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- So a table added later is not silently unreachable. anon is deliberately
-- left out: a new table stays invisible to the public until someone grants it
-- explicitly, in writing.
alter default privileges in schema public
    grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
    grant all privileges on tables to service_role;
alter default privileges in schema public
    grant all privileges on sequences to service_role;

-- ══════════════════════════════════════════════════════════════
-- 8. The read path
-- ══════════════════════════════════════════════════════════════
-- Returns the entire SiteData document in the exact shape src/data/types.ts
-- declares, so the frontend makes one call and no component knows how any of
-- this is stored.

create or replace function public.get_site_data()
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
    v_product public.products%rowtype;
    v_company public.company%rowtype;
    sections  jsonb;
begin
    -- A half-seeded database is an error, not a blank page.
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

    -- Testimonials were rows once, so RLS hid the invisible ones. Inside jsonb
    -- there are no rows to filter, and without this an anonymous visitor would
    -- receive testimonials marked visible:false. auth.role() is used rather
    -- than is_admin() because anon has no EXECUTE on that function.
    if coalesce(auth.role(), '') <> 'authenticated' and sections ? 'testimonials' then
        sections := jsonb_set(sections, '{testimonials,items}', coalesce((
            select jsonb_agg(item)
            from jsonb_array_elements(sections -> 'testimonials' -> 'items') item
            where coalesce((item ->> 'visible')::boolean, false)
        ), '[]'::jsonb));
    end if;

    return sections || jsonb_build_object(

        'brand', jsonb_build_object(
            'name',             v_company.name,
            'tagline',          v_company.tagline,
            'shortDescription', v_company.short_description,
            'location',         v_company.location,
            'phone',            v_company.phone,
            'phoneDisplay',     v_company.phone_display,
            'email',            v_company.email,
            'useDefaultTime',   v_company.use_default_time,
            'mapEmbed',         v_company.map_embed,
            'hours',            v_company.hours,
            'socialLinks',      v_company.social
        ),

        'featuredProduct', jsonb_build_object(
            'id',            v_product.slug,
            'name',          v_product.name,
            'collection',    v_product.collection,
            'concentration', v_product.concentration,
            'headlineSize',  v_product.headline_size,
            'tagline',       v_product.tagline,
            'description',   v_product.description,
            'price',         v_product.price,
            'orderingNote',  v_product.ordering_note,
            'images',        v_product.images,
            'sizes',         v_product.sizes,
            'notes',         v_product.notes,
            'highlights',    v_product.highlights,
            'specs',         v_product.specs,
            'usage',         v_product.usage
        ),

        -- Blur placeholders for an <Img> wrapper. Not part of SiteData.
        'media', jsonb_build_object(
            'lqip', coalesce((
                select jsonb_object_agg(m.public_url, m.lqip)
                from public.media_assets m
                where m.kind = 'object' and m.lqip <> '' and m.public_url is not null
            ), '{}'::jsonb)
        )
    );
end;
$$;

grant execute on function public.get_site_data() to anon, authenticated;
