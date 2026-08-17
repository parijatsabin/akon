# ANOK backend — Supabase

Supabase is the only source of website content. There is no JSON fallback and
no bundled content: if the database is unreachable the site shows an error
rather than something stale. See [MIGRATION.md](../MIGRATION.md) for the
reasoning behind every decision here.

## Layout

```
supabase/
├── config.toml              local stack settings
└── migrations/
    └── 0001_initial.sql     the whole schema, in one file
```

## The six tables

| Table | Holds |
|---|---|
| `site_content` | one row per page section, `data` matching src/data/types.ts |
| `company` | brand identity, opening hours, social links |
| `products` | typed scalars + jsonb for images/sizes/notes/highlights/specs/usage |
| `contacts` | enquiries and newsletter signups, split by `kind` |
| `media_assets` | images, size-tiered (see below) |
| `profiles` | CMS accounts and roles |

**Why jsonb and not more tables.** Nothing ever queries *inside* the content —
`get_site_data()` fetches the whole document, every time, and that is the only
read path. The previous 27-table schema was paying for query flexibility that
was never used. Saving a section is now a single upsert instead of an UPDATE
plus a delete-and-reinsert across child tables.

**What that costs.** No per-row CHECKs on list items (rating range, day names),
and image references inside jsonb are not foreign keys. The second one is
handled by `guard_media_in_use()`, which refuses to delete an asset whose URL
still appears in `site_content` or `products` — the FK's protection, enforced
from the other side.

**Navigation is not in the database.** The navbar and footer links point at
fixed routes and are constants in `Navbar.tsx` / `Footer.tsx`. Changing a label
is a code change. This is a deliberate exception to "all content from the
database", taken because three tables for six unchanging links was not paying
for itself.

**Testimonials visibility.** These used to be rows, so RLS hid the invisible
ones. Inside jsonb there are no rows to filter, so `get_site_data()` drops
`visible: false` items for unauthenticated callers. If you change that
function, keep that filter.

## Everyday commands

```bash
npm run verify                       # health check: content, RLS, payload size
npm run ingest-media -- ./photo.jpg  # add an image, prints the URL to paste
npm run bootstrap                    # create/repair the superadmin
```

**There is no seed file.** Nine incremental migrations were squashed into
`0001_initial.sql` once the design settled, and the old `seed.sql` targeted the
pre-consolidation schema, so it could no longer run. The content lives in this
project's database and nowhere else.

That means a *brand new* Supabase project would get the schema but no content,
and `get_site_data()` would raise `site data is not seeded`. If you ever need
that, ask for a content export before you need it — not after.

## Deploying to a hosted project

Target project: **`cilrqtdwkfytjhltluln`**. (An earlier project,
`cgwptrjlybjrzcnxmwfm`, was superseded — both exist, so check the ref before
pushing anything.)

No database password is needed. `supabase login` stores an access token, and
the CLI provisions a temporary login role for each command.

```bash
npx supabase login                          # browser, once per machine
npx supabase link --project-ref cilrqtdwkfytjhltluln
npx supabase db push                        # migrations

npm run bootstrap                           # superadmin
npm run verify                              # health check
```

Retrieve the keys without visiting the dashboard:

```bash
npx supabase projects api-keys --project-ref cilrqtdwkfytjhltluln
```

After any schema change, re-run both advisors — they caught a SECURITY DEFINER
view and 30 duplicate policy evaluations that no test of ours would have:

```bash
npx supabase db advisors --linked --type security
npx supabase db advisors --linked --type performance
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Cloudflare build
environment. They are inlined at build time, so changing them requires a
rebuild, not just a redeploy.

## Things worth knowing before you change something

**Media is size-tiered.** Assets ≤ 8 KB are base64 `data:` text in
`media_assets.data_url`; larger ones are Storage objects with an immutable
cache header plus a ~600-byte base64 LQIP blur. The `tier_consistent` and
`inline_is_small` CHECKs and the 200 KB ceiling trigger are what keep that
true — a convention enforced only by the upload script is not enforced.

**`get_site_data()` is not SECURITY DEFINER.** RLS still applies to the tables
it reads. Testimonial visibility is the one thing it filters itself — see
above.

**Superadmins are bootstrap-only.** The `profiles` guard trigger refuses
`role = 'superadmin'` from any anon/authenticated caller. Only the service role
(i.e. `npm run bootstrap`) can create one, and the last active superadmin
cannot be deleted, demoted, or deactivated.

**Adding a section?** It is a row in `site_content`, not a table — insert the
key and add it to `SiteData` in `src/data/types.ts`. Adding a real *table* is
rarely right; if you do, enable RLS, grant the roles explicitly, and index
every foreign key.

**No image upload in the CMS yet.** The media-library page was deferred, so
image fields accept a URL but cannot upload one. Use
`npm run ingest-media -- ./photo.jpg` and paste the URL it prints. An address
that matches no stored asset is saved as no image rather than a broken link.

**Still deferred:** `audit_log`, the CMS media library, and the
`admin-create-user` edge function. Creating a *second* admin needs that
function, so for now the single bootstrapped superadmin runs the CMS.
