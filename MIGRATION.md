# MIGRATION PROMPT — ANOK: JSON → Supabase (single source of truth)

> ## ⚠ Superseded — historical record
>
> This was the plan for migrating off `cms-data.json`. **That work is done**,
> and parts of this document no longer describe the system:
>
> - §4's normalised schema (27 tables, 16 migrations) was later collapsed to
>   **6 tables in one migration**. Nothing ever queried *inside* the content,
>   so the normalisation was paying for flexibility that was never used.
> - Navigation tables were dropped entirely; the navbar and footer links are
>   constants in the components.
> - `audit_log` was deferred and never built.
> - The `admin-create-user` edge function was deferred, then built as specced
>   in §4 — together with `/admin/users` and a self-service `/admin/account`
>   password page, which §7.6 did not anticipate. It is needed because
>   generated passwords have no reset email to escape through.
>
> **For how the system actually works, read [supabase/README.md](supabase/README.md).**
> Kept only for the reasoning behind the decisions that survived — the media
> tiering in §2C, and the username-auth design in §2.


> This file is a **prompt**. Hand it to an implementing agent (or follow it yourself).
> It was written after a direct inspection of this repository at branch `main`, commit `25c7e3e`.
> Everything in §1 is verified fact about the current code, not assumption.
> §2 records the decisions that answered the open questions in the original brief
> (TASK.md, since removed — it was superseded by this file and held credentials).
> §3 onward is the work to do.

---

## 0. Role and objective

You are a senior full-stack engineer working in this repository (`d:\.abion\akon`, project `akon` / package `odore-perla`).

**Objective:** make **Supabase the exclusive source of every piece of website content, media, and identity**. After this migration:

- No `cms-data.json`. No static content constants. No defaults object. No fallback content of any kind.
- If Supabase is unreachable, the site shows an explicit error state — it must **never** render stale or bundled content.
- The `/admin` CMS performs real CRUD against Supabase, in production, authenticated.
- Two roles exist — `superadmin` and `admin` — enforced in the database via RLS, not only in the UI.
- Images are managed from the CMS, stored under a **size-tiered strategy** (§2C): tiny assets as base64 text in Postgres, photographs as Supabase Storage objects. Both are Supabase — there is still exactly one source of truth.

Do not invent content. Every value that exists today in `public/cms-data.json` must survive the migration byte-for-byte into the database.

---

## 1. Verified current state

### 1.1 Stack

| Thing | Value |
|---|---|
| Framework | React 18.3 + TypeScript 5.5, Vite 8, `react-router-dom` 6.30 |
| Hosting | Cloudflare Workers static assets — [wrangler.jsonc](wrangler.jsonc), `not_found_handling: single-page-application` |
| Build | `tsc && vite build` → `dist/`, deployed with `wrangler deploy` |
| Icons | `lucide-react` |
| Backend | **None.** No API, no database, no server runtime. |
| Env/secrets | **None configured.** No `.env`, no `import.meta.env` usage. |

### 1.2 Data layer (the thing being replaced)

```
public/cms-data.json  (516 lines, 14 top-level sections)
        │  fetch(`/cms-data.json?t=${Date.now()}`)
        ▼
src/data/siteRepository.ts   ← the ONLY module that knows where data lives
        │  in-memory `cache`, `readStore()` sync accessor
        ▼
src/data/SiteDataProvider.tsx  ← renders nothing until loaded; loading/error states
        │  useSiteData()
        ▼
every public component + every admin form initialiser
```

- [src/data/types.ts](src/data/types.ts) (264 lines) defines the whole content model, rooted at `interface SiteData`.
- [src/data/siteRepository.ts](src/data/siteRepository.ts) exposes `fetchSiteData()`, `readStore()`, `writeStore()`, `updateSection()`, `SiteDataError`, and a shallow `assertValid()` that checks the 14 required sections exist.
- Writes go to `POST /__cms_write`, implemented as a **Vite dev-server middleware** in [vite.config.ts](vite.config.ts) that `writeFileSync`s `public/cms-data.json`. **It does not exist in production** — saving from a deployed CMS fails by design today.
- Live refresh after save is a `window.dispatchEvent(new CustomEvent("cms:update"))` listened to by `SiteDataProvider`.
- [src/admin/lib/saveSection.ts](src/admin/lib/saveSection.ts) is the single save path every admin form calls.

**This design is a gift for the migration:** the seam is already isolated. The header comment in `siteRepository.ts` even anticipates it. Most of the work is behind that one module — but *not all of it*, see §7.

### 1.3 Content model — the 14 sections of `SiteData`

Exact shape as it exists in the JSON today (array lengths are current row counts to migrate):

| Section | Shape | Repeating children |
|---|---|---|
| `brand` | object | `hours` array[7] (`day,isClosed,openTime,closeTime`), `socialLinks` object (instagram, facebook, pinterest), plus `name, tagline, shortDescription, location, phone, phoneDisplay, email, useDefaultTime, mapEmbed` |
| `navLinks` | array[3] | `label, href, enabled` |
| `hero` | object | `smallLabel, smallLabelHighlight, mainHeading, description, videoUrl, backgroundImage` + `ctaPrimary`/`ctaSecondary` (`label, href`) |
| `about` | object | `reasons` array[4] (`id, title, body`) + 10 scalar fields incl. `ctaStripImage` |
| `featuredProduct` | object (single flagship product) | `images` array[3], `sizes` array[4], `highlights` array[3] (`id,title,body`), `specs` array[5] (`label,value`), `usage` array[3] (`id,title,body`), `notes` = `{top,heart,base}` each `{ingredients: string[], impression: string}` + `id,name,collection,concentration,headlineSize,tagline,description,price,orderingNote` |
| `testimonials` | object | `sectionTag, headline` + `items` array[3] (`id:number, quote, author, title, rating, visible, order`) |
| `commitment` | object | `tag, headline, body, imageUrl`, `cta`, `pillars` array[4] (`id, icon, title, body`) |
| `newsletter` | object | `eyebrow, headline, brandHighlight, subtext, placeholder, cta, backgroundImage` |
| `footer` | object | `tagline, hoursHeading`, `credit{label,href}`, `navColumns` array[2] each `{heading, links[]{label,href}}` |
| `contact` | object | `pageTag, pageSubtitle`, `subjects` array[6] |
| `privacy` | object | `title, intro, lastUpdated`, `sections` array[7] (`id, heading, body`) |
| `terms` | object | same shape | `sections` array[8] |
| `faq` | object | `title, intro`, `items` array[9] (`id, question, answer`) |
| `seo` | object | `metaTitle, metaDescription, keywords, ogImage, ogTitle, ogDescription` |

### 1.4 Media — currently static files

Measured sizes, on disk today:

| File | Size | Referenced from |
|---|---:|---|
| `public/images/1.webp` | 116 KB | `about.ctaStripImage` |
| `public/images/2.webp` | 163 KB | `newsletter.backgroundImage` |
| `public/images/3.webp` | 85 KB | **unreferenced** |
| `public/images/4.webp` | 19 KB | `featuredProduct.images[0]` |
| `public/images/5.webp` | 51 KB | `commitment.imageUrl` |
| `public/images/6.webp` | 72 KB | `featuredProduct.images[1]` |
| `public/images/7.webp` | 49 KB | `featuredProduct.images[2]` |
| `public/logo.png` | 55 KB | not content — check `index.html` |
| `public/anok-1.jpeg` | 31 KB | not content — check `index.html` |
| `public/favicon.ico` | 15 KB | `index.html` — stays static |

**Total webp: 547 KB. Referenced webp: 463 KB.** `hero.videoUrl` / `hero.backgroundImage` are strings that may be blank.

These numbers drive §2C. Note `logo.png` at 55 KB is oversized for a logo and `2.webp` at 163 KB is oversized for a background — both should shrink during migration, not merely move.

### 1.5 Auth — currently fake

[src/admin/auth/AuthContext.tsx](src/admin/auth/AuthContext.tsx):
- `CREDENTIALS = { admin: "<sha256 of 'admin123'>" }` — **hardcoded in the client bundle**.
- Session = `sessionStorage["anok_admin_session"]` holding `{username, exp, token}` with an 8-hour TTL and a random nonce that is never verified server-side.
- `AdminRoute` guards on that client-side flag only. **There is no server; the guard is decorative.**
- No roles, no user list, no user management UI.

### 1.6 CMS surface today

[src/admin/AdminApp.tsx](src/admin/AdminApp.tsx) routes: `login`, `/` Dashboard, `settings` (878-line `GlobalSettingsPage` covering brand/nav/hero/about/commitment/newsletter/footer), `featured`, `testimonials`, `pages` (contact/privacy/terms/faq), `seo`, plus legacy redirects.

### 1.7 Forms that pretend to work

- [src/components/Newsletter.tsx](src/components/Newsletter.tsx) — `handleSubmit` sets local `submitted` state. **The email is discarded.**
- [src/pages/ContactPage.tsx](src/pages/ContactPage.tsx) — `handleSubmit` validates then sets `submitted`. **The message is discarded.**

Both must become real Supabase inserts (§6.4).

---

## 2. Decisions (these answer the original brief — implement them as written)

| # | Open question from the brief | Decision |
|---|---|---|
| 1 | Auth style for `9868348282` | **Option C — username externally, email internally.** CMS login form shows *Username + Password*. The client resolves the username to a synthetic internal email `<username>@auth.anok.local` and calls `supabase.auth.signInWithPassword`. A `profiles` table holds the real `username` with a unique constraint. This keeps a plain username UX without SMS/OTP cost or provider setup. |
| 2 | Roles | **Exactly the matrix from the brief.** Both roles have full content CRUD. Only `superadmin` may create/delete admins or change roles. **No one** may create a superadmin through the CMS — superadmin creation is bootstrap-only. |
| 3 | Superadmin count | Exactly one, created by a bootstrap script, not by a migration. |
| 4 | Media | **Size-tiered, see §2C.** Assets ≤ 8 KB are stored as base64 `data:` text in Postgres; anything larger goes to Supabase Storage bucket `media` and the DB stores its public URL. Every Storage-backed image additionally carries a ~600-byte base64 LQIP blur placeholder inline. `favicon.ico` stays a static asset (referenced by `index.html`, not by content). |
| 5 | "No JSON" | Confirmed and absolute: delete `public/cms-data.json`, delete the `/__cms_write` Vite plugin, no defaults, no fallback, no bundled content. A Supabase failure renders the existing `SiteError` component. |
| 6 | Migrations | Numbered SQL files under `supabase/migrations/`, plus `supabase/seed.sql` containing the real content extracted from today's JSON. |
| 7 | The initial superadmin password | **Never committed.** It goes into `.env.local` (git-ignored) as `SUPERADMIN_PASSWORD` and is consumed by `scripts/bootstrap-superadmin.ts`, which runs against the service-role key. The repo must contain no plaintext password in any file — this document included, which is why the value that was originally written here has been redacted. Supabase Auth stores only a bcrypt hash. Since the credential was shared in plaintext during setup, treat it as compromised and rotate it: `npm run bootstrap` resets the password of an existing superadmin, so changing `SUPERADMIN_PASSWORD` in `.env.local` and re-running it is enough. |

### Three further decisions you must make and must not skip

**A. Schema strategy — normalized, not a jsonb blob.**
The brief asks for real FKs, indexes and constraints, so do not store each section as one `jsonb` column. Use:
- **Singleton tables** for one-of-a-kind sections (`brand`, `hero`, `about`, `commitment`, `newsletter`, `footer`, `contact_page`, `faq_page`, `seo`, `testimonials_section`). Enforce singleton-ness with `id boolean PRIMARY KEY DEFAULT true CHECK (id)`.
- **Child tables** with `position int NOT NULL` for every repeating list (`business_hours`, `nav_links`, `about_reasons`, `product_images`, `product_sizes`, `product_highlights`, `product_specs`, `product_usage`, `product_notes`, `testimonials`, `commitment_pillars`, `footer_nav_columns`, `footer_nav_links`, `contact_subjects`, `policy_pages` + `policy_sections`, `faq_items`).
- The **only** acceptable `jsonb` is `product_notes.ingredients` (a `text[]` is also fine and preferred).

**B. Read path — one RPC, not 20 round trips.**
Create a `SECURITY DEFINER`-free, `STABLE` SQL function `public.get_site_data() RETURNS jsonb` that assembles the entire `SiteData` document in the **exact shape `src/data/types.ts` already declares**. The frontend then keeps its current architecture verbatim: one call, one document, `SiteDataProvider` unchanged in structure. This is the single highest-leverage decision in this migration — it means the public site's 20+ components need **zero** changes.

**C. Media — size-tiered base64 / Storage. Read this section carefully; it is the one most likely to be got wrong.**

The requirement is "base64 text for minimal storage" against a **5 GB quota**. Two facts have to be reconciled before writing any code:

1. **Storage capacity is not the constraint.** The entire current image set is 547 KB — about **0.01%** of 5 GB. Even a hundred future product photos at 200 KB each would use 20 MB, or 0.4%. You will not run out of space. Optimising for bytes-at-rest here optimises the one resource that is not scarce.
2. **Base64 costs more, not less, on every axis that is actually scarce.** It inflates bytes by **+33%** (463 KB → 617 KB). Because it lives inside the `get_site_data()` JSON document, it is re-transferred on **every page load by every visitor** — no browser cache, no CDN cache, no `304 Not Modified`. It also lands in the one payload that [SiteDataProvider](src/data/SiteDataProvider.tsx#L52) blocks first paint on. Naive base64-everything turns a 35 KB blocking payload into a ~620 KB one and multiplies egress by the number of page views.

Where base64 genuinely wins is **small assets**, where the HTTP round trip (~50–150 ms) costs more than the bytes. So the rule is a size threshold, not a blanket policy:

```
                      asset uploaded
                            │
                  ┌─────────┴─────────┐
            ≤ 8 KB                > 8 KB
                  │                   │
       base64 data: URL       Storage object in `media`
       in media_assets        + ~600B base64 LQIP blur
       .data_url TEXT           stored inline alongside
                  │                   │
                  └─────────┬─────────┘
                            ▼
              get_site_data() resolves BOTH
              to a ready-to-use src string
              → components need zero changes
```

**Rules — implement exactly:**

- **Threshold: 8 KB** after optimisation (`INLINE_MAX_BYTES`, one constant, referenced by the DB CHECK, the upload script, and the CMS uploader — do not hardcode it three times). This started at 20 KB and was tuned down *after measuring*: a 13.6 KB product image became 18 KB of base64 and pushed the blocking payload to 58.9 KB. At 8 KB the same document is 19.3 KB. 8 KB is also the conventional inline-vs-request cutoff, and the round trip it saves is only worth it below roughly that size.
- **Hard ceiling on inline total.** Add a `CHECK (octet_length(data_url) <= 12000)` on the row, and a trigger that raises if the **sum** of all inline `data_url` bytes would exceed **200 KB**. Without this, the tier silently degrades into base64-everything one upload at a time, and nobody notices until the site is slow. This constraint is the whole safeguard — do not omit it.
- **LQIP for every Storage-backed image.** Generate a 16px-wide, heavily-compressed webp (~400–800 bytes), base64 it, store in `media_assets.lqip`. This is the *correct* use of base64: it inlines into the content document at negligible cost, paints instantly, and the real image fades in over it. It is also what makes lazy-loading the big images visually acceptable.
- **`get_site_data()` resolves both tiers to a plain string.** An inline asset resolves to its `data:image/webp;base64,…` URL; a Storage asset resolves to its public URL. Either way `commitment.imageUrl` stays a string that works directly as `src` — **no component changes, no lazy second fetch, no new frontend plumbing**. Expose the LQIP map as a sibling key (e.g. `media.lqip[url]`) so an `<Img>` wrapper can use it without changing the section types.
- **Optimise on ingest, never store what the user uploaded raw.** Every upload — script or CMS — is re-encoded to webp at quality 80, capped at 1920px on the long edge, stripped of EXIF. Measured on today's assets: `logo.png` 55 KB → 16.9 KB, `anok-1.jpeg` 31 KB → 7.2 KB, `4.webp` 19.4 KB → 13.6 KB. The seven `.webp` files were already near-optimal and were kept as-is rather than re-encoded larger. **This is the step that actually delivers "minimal storage"** — an order of magnitude more than base64 encoding could, and in the right direction.
- **Deduplicate by content hash.** `media_assets.checksum` = sha256 of the optimised bytes, `UNIQUE`. Re-uploading the same photo reuses the existing row instead of doubling it.

Measured result: blocking payload **19.3 KB** (vs ~620 KB for base64-everything), 1 asset inline (9.6 KB of base64), 8 in Storage (547 KB), LQIP blurs 1.8 KB total. Images cached by browser and CDN, egress paid once per visitor rather than once per page view, at-rest usage ~0.01% of the 5 GB.

If you disagree with the threshold, change the constant — but do not remove the tiering, and do not remove the sum-ceiling trigger.

---

## 3. Deliverable 1 — Supabase project setup

Create `.env.local` (git-ignored) and `.env.example` (committed, values blank):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# server-side / scripts only — never prefixed VITE_, never in the bundle
SUPABASE_SERVICE_ROLE_KEY=
SUPERADMIN_USERNAME=9868348282
SUPERADMIN_PASSWORD=
```

Add `@supabase/supabase-js` to `dependencies`. Confirm `.env*.local` is in `.gitignore` before writing any secret.

Create `src/lib/supabase.ts` — a single browser client built from `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, throwing a clear startup error if either is missing. Never import the service-role key anywhere under `src/`.

---

## 4. Deliverable 2 — Database

> **V1 scope, decided 2026-08-17.** The schema below was built in full, then
> trimmed to what the website needs to *run*. Four things are deferred, not
> cancelled: `audit_log` (and its 30 triggers), `contact_submissions`,
> `newsletter_subscribers`, and the `admin-create-user` edge function. The
> contact and newsletter forms keep discarding their input exactly as they do
> today, and a single bootstrapped superadmin runs the CMS. Every **content**
> table survived — `seo` included, because [PublicSite.tsx:20](src/PublicSite.tsx#L20)
> reads it on every page load to set the document title and meta tags.
>
> The 16 migration files below were also consolidated into **5**, which is safe
> precisely because nothing had been deployed yet. The real layout is:
> `0001_foundation` (extensions, helpers, profiles, roles, guards) ·
> `0002_media` · `0003_content` · `0004_security` (grants **and** RLS) ·
> `0005_api`. Media is defined before content so image columns are plain FKs
> rather than later `ALTER`s.

Layout:

```
supabase/
├── config.toml
├── migrations/
│   ├── 0001_extensions.sql        -- pgcrypto / uuid-ossp, set_updated_at() trigger fn
│   ├── 0002_roles_profiles.sql    -- app_role enum, profiles, is_admin()/is_superadmin()
│   ├── 0003_brand.sql             -- brand + business_hours + social links
│   ├── 0004_navigation.sql        -- nav_links, footer, footer_nav_columns/links
│   ├── 0005_hero_about.sql        -- hero, about, about_reasons
│   ├── 0006_product.sql           -- products + images/sizes/highlights/specs/usage/notes
│   ├── 0007_testimonials.sql
│   ├── 0008_commitment_newsletter.sql
│   ├── 0009_pages.sql             -- contact_page, contact_subjects, policy_pages,
│   │                                 policy_sections, faq_page, faq_items
│   ├── 0010_seo.sql
│   ├── 0011_media.sql             -- media_assets (tiered) + storage bucket & policies
│   ├── 0012_submissions.sql       -- contact_submissions, newsletter_subscribers
│   ├── 0013_audit_log.sql
│   ├── 0014_rls.sql               -- every policy, in one reviewable place
│   └── 0015_get_site_data.sql     -- the aggregate read function
└── seed.sql                       -- the real content, extracted from cms-data.json
```

Rules for every content table:
- `id uuid PRIMARY KEY DEFAULT gen_random_uuid()` (except singletons, see §2A).
- `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()` with a shared `set_updated_at()` BEFORE UPDATE trigger.
- `updated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL` on every content table.
- Child tables: `ON DELETE CASCADE` to their parent, `position int NOT NULL`, and a `UNIQUE (parent_id, position) DEFERRABLE INITIALLY DEFERRED` so reordering in one transaction doesn't trip the constraint.
- `NOT NULL` on every field the TypeScript type declares as non-optional. Today's model has **no optional fields** — blank is `''`, not null. Preserve that: `NOT NULL DEFAULT ''`.
- Meaningful `CHECK`s: `testimonials.rating BETWEEN 1 AND 5`, `business_hours.day` restricted to the seven day names, `open_time`/`close_time` as `text` (they are display strings today — do not silently convert to `time` and change rendering).
- Indexes on every FK and on `(parent_id, position)`.
- Preserve the human-readable slug ids that exist in the JSON today (`about.reasons[].id`, `commitment.pillars[].id`, `faq.items[].id`, `policy sections[].id`, product child ids) in a `slug text NOT NULL` column — components and React keys use them.
- `testimonials.id` is a **number** in the current type. Introduce a uuid PK and keep the numeric value as `legacy_id int`, or change the TS type to `string`. Pick one, apply it consistently, and state which you chose.

### `media_assets` — the tiered registry (§2C)

```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
kind         media_kind NOT NULL          -- enum ('inline','object')
filename     text NOT NULL                -- original name, for the CMS list
mime_type    text NOT NULL CHECK (mime_type IN
                ('image/webp','image/png','image/jpeg','image/svg+xml'))
bytes        int  NOT NULL CHECK (bytes > 0)
width        int  NOT NULL DEFAULT 0
height       int  NOT NULL DEFAULT 0
alt          text NOT NULL DEFAULT ''     -- accessibility; editable in the CMS
checksum     text NOT NULL UNIQUE         -- sha256 of the optimised bytes, dedupe key

-- exactly one of these two is populated, enforced below
data_url     text                         -- 'data:image/webp;base64,…'  (kind='inline')
storage_path text                         -- 'sections/commitment-a1b2.webp' (kind='object')
public_url   text                         -- resolved Storage URL       (kind='object')
lqip         text NOT NULL DEFAULT ''     -- ~600B base64 blur, objects only

created_at / updated_at / updated_by

CONSTRAINT tier_consistent CHECK (
  (kind = 'inline' AND data_url IS NOT NULL
                   AND storage_path IS NULL AND public_url IS NULL)
  OR
  (kind = 'object' AND data_url IS NULL
                   AND storage_path IS NOT NULL AND public_url IS NOT NULL)
)
CONSTRAINT inline_is_small CHECK (
  data_url IS NULL OR octet_length(data_url) <= 12000   -- 8KB raw → ~10.9KB base64
)
```

Plus the ceiling trigger from §2C:

```sql
-- BEFORE INSERT OR UPDATE ON media_assets
-- raise if SUM(octet_length(data_url)) across kind='inline' would exceed 200_000
```

Every content column that today holds an image path (`about.cta_strip_image`, `commitment.image_url`, `newsletter.background_image`, `product_images.url`, `hero.background_image`, `seo.og_image`) becomes `media_id uuid REFERENCES media_assets(id) ON DELETE SET NULL`. `get_site_data()` resolves it back to a string. `ON DELETE SET NULL` rather than `RESTRICT` so deleting an asset never wedges the CMS — but the media page must warn when an asset is in use, and show the usage count.

### `profiles`

```
id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
username citext UNIQUE NOT NULL CHECK (length(username) >= 3)
full_name text NOT NULL DEFAULT ''
role app_role NOT NULL DEFAULT 'admin'      -- enum ('superadmin','admin')
is_active boolean NOT NULL DEFAULT true
created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
created_at / updated_at
```

Add a trigger on `auth.users` insert to create the matching profile row, reading `username` from `raw_user_meta_data`.

Add two `SECURITY DEFINER STABLE` helpers with `SET search_path = public, pg_temp`:

```sql
public.is_admin()      -- true for active superadmin OR admin
public.is_superadmin() -- true for active superadmin only
```

These must read `profiles` directly. **Do not** write RLS policies that query `profiles` inline — that recurses. All policies call these functions.

Enforce the role rules in the database, not just the UI:
- A `BEFORE INSERT OR UPDATE` trigger on `profiles` that raises if `NEW.role = 'superadmin'` and the caller is not the service role. The CMS can never mint a superadmin.
- A trigger blocking a user from changing their own `role` or `is_active`.
- A trigger blocking deletion of the last remaining active superadmin.

### Creating an admin needs a server — `supabase/functions/admin-create-user`

**Gap found during implementation, not in the original plan.** Creating a Supabase Auth user requires `auth.admin.createUser`, which requires the **service-role key** — and that key can never reach the browser. So the CMS cannot create an admin directly, no matter what the RLS policies say. The superadmin-only "create admin" requirement is therefore impossible to satisfy with the anon key alone.

The fix is a Supabase Edge Function that runs server-side:

```
CMS (superadmin session)
   │  POST /functions/v1/admin-create-user  { username, password, fullName }
   ▼
Edge function
   ├─ builds a client bound to the CALLER's JWT, calls is_superadmin() as them
   │    → 403 if they are not one. The check runs under RLS, as the user.
   ├─ validates username format and password length
   └─ service-role createUser(<username>@auth.anok.local), role fixed to 'admin'
```

Two independent guards stop it minting a superadmin: the role is hardcoded in the function, and the `profiles` trigger refuses `superadmin` from any API caller regardless. If the function creates the auth user but the profile update fails, it deletes the auth user — a half-made account is worse than none.

`verify_jwt = false` in `config.toml` is deliberate: the function verifies the JWT itself so it can return a clean 403 rather than an opaque gateway error.

---

## 5. Deliverable 3 — RLS policy matrix

Enable RLS on **every** table in `public`. No table may be left open.

| Table group | `anon` (public site) | `authenticated` admin/superadmin | superadmin only |
|---|---|---|---|
| All content tables | `SELECT` | `SELECT, INSERT, UPDATE, DELETE` via `is_admin()` | — |
| `profiles` | ❌ none | `SELECT` all (needed for the user list), `UPDATE` own `full_name` only | `INSERT`, `UPDATE role/is_active`, `DELETE` via `is_superadmin()` |
| `contact_submissions` | `INSERT` only | `SELECT`, `UPDATE` (mark read), `DELETE` | — |
| `newsletter_subscribers` | `INSERT` only | `SELECT`, `DELETE` | — |
| `audit_log` | ❌ none | `SELECT` | — |
| `media_assets` | `SELECT` | full CRUD via `is_admin()` | — |

Notes you must honour:
- `anon` gets **read-only** access to content and **insert-only** access to the two submission tables. Anonymous `INSERT` policies must have a `WITH CHECK` that constrains the inserted row (e.g. status column forced to `'new'`) so a bot can't seed arbitrary state. Rate-limiting is out of scope for the DB — note it as a follow-up.
- `anon` must **never** be able to read `contact_submissions` or `newsletter_subscribers`. Verify this explicitly; a leaked customer list is the single worst failure mode of this migration.
- `testimonials` are visible to `anon` regardless of the `visible` flag **only if** you filter in `get_site_data()`. Safer: the anon `SELECT` policy itself adds `USING (visible = true)`, and the CMS reads via an authenticated session that sees all. Do this.

### Storage

Bucket `media`, **public read** — public so Cloudflare's CDN and the browser can cache the objects, which is the entire performance argument in §2C. Signed URLs would defeat it and are unnecessary for public marketing images.

- Policies: `SELECT` for `public`; `INSERT`/`UPDATE`/`DELETE` restricted to `is_admin()`.
- `allowed_mime_types`: `image/webp`, `image/png`, `image/jpeg`, `image/svg+xml`. `file_size_limit`: **2 MB** — generous for a post-optimisation asset, and a backstop against an unoptimised original slipping through.
- Prefixes: `hero/`, `product/`, `sections/`, `brand/`.
- Set a long `cacheControl` on upload (`public, max-age=31536000, immutable`). Filenames include the content hash (§6.2), so a changed image is a new filename — cache invalidation is free and no purge is ever needed.

Objects ≤ 8 KB never reach this bucket; they live in `media_assets.data_url` (§2C).

---

## 6. Deliverable 4 — Data migration and seeding

**Order matters: `ingest-media` runs first.** Image fields in the seed resolve to `media_assets` rows by checksum, so the manifest has to exist before the seed can be generated.

1. `scripts/ingest-media.ts` (service-role key) — the optimisation + tiering pipeline from §2C. For each of `public/images/*.webp`, `public/logo.png`, `public/anok-1.jpeg`:

   ```
   read file
     → sharp: re-encode webp q80, cap long edge 1920px, strip EXIF
     → sha256(optimised) = checksum; skip if that checksum already exists
     → if bytes <= 8_192:  kind='inline',  data_url = 'data:image/webp;base64,' + b64
       else:                kind='object',  upload to media/<prefix>/<name>-<hash8>.webp
                                            with cacheControl immutable,
                            + sharp resize 16px q20 → lqip (base64, ~600B)
     → INSERT media_assets, print the tier decision and before/after bytes
   ```

   Then rewrite the seed so every image field references the resulting `media_id`. Include `3.webp` even though nothing references it today — it becomes an unused library asset, visible in the CMS media page.

   Add `sharp` as a **devDependency** (it is a build-time tool, never bundled into the client). The script must print a summary table: filename, original bytes, optimised bytes, tier, and the total inline footprint against the 200 KB ceiling. If any single asset fails to shrink below its original, keep the original and say so rather than silently writing a larger file.

   Output: `supabase/media-manifest.json`. The script writes to Storage and to that file — **never to the database**. Every DB insert lives in `seed.sql` so there is one place to look when the content is wrong.

2. `scripts/extract-seed.ts` reads `public/cms-data.json` **plus the manifest** and generates `supabase/seed.sql`. Generating beats hand-typing 516 lines: it is auditable and re-runnable. The seed truncates content tables and re-inserts, and never touches `profiles` or `auth.users` — re-seeding must not be able to lock anyone out.
3. `scripts/bootstrap-superadmin.ts` — service-role `auth.admin.createUser` with `email: '<SUPERADMIN_USERNAME>@auth.anok.local'`, `email_confirm: true`, `user_metadata: { username }`, password from `process.env.SUPERADMIN_PASSWORD`. Then set that profile's role to `superadmin`. The script must refuse to run if `SUPERADMIN_PASSWORD` is unset, and must be idempotent.
4. **Verification gate:** write `scripts/verify-migration.ts` that calls `get_site_data()` and deep-diffs the result against the original `cms-data.json` (with image URLs normalised). It must print `0 differences` before you proceed to §7. Do not delete the JSON until this passes.

---

## 7. Deliverable 5 — Frontend changes

### 7.1 `src/data/siteRepository.ts` — rewrite, keep the exported surface

Keep `fetchSiteData()`, `readStore()`, `SiteDataError` exactly as exported today so no caller changes.

- `fetchSiteData()` → `supabase.rpc('get_site_data')`, validate, cache, return.
- Keep `assertValid()` and extend it: a missing section from the DB is now a hard error, exactly as it is for a truncated JSON file today.
- **Delete `writeStore()` and `updateSection()`.** Whole-document writes make no sense against a relational schema and would clobber concurrent edits.

### 7.2 New `src/data/adminRepository.ts`

Per-entity CRUD used only by `/admin`: `updateBrand()`, `upsertNavLinks()`, `updateHero()`, `updateAbout()` + reasons, product + its six child collections, testimonials CRUD, commitment + pillars, newsletter, footer + columns/links, contact + subjects, policy pages + sections, faq, seo, media upload/delete, and user management. Each function targets one table, uses `.select()` to return the saved row, and surfaces the Postgres error message on failure.

### 7.3 `src/admin/lib/saveSection.ts`

Rewrite as a thin wrapper over an arbitrary async save function that still handles toast + error + never-leave-the-button-spinning. Its role as the single save path is worth preserving; only its body changes.

Then update each admin page ([GlobalSettingsPage](src/admin/pages/GlobalSettingsPage.tsx) 878 lines, [FeaturedProductPage](src/admin/pages/FeaturedProductPage.tsx), [TestimonialsPage](src/admin/pages/TestimonialsPage.tsx), [PagesPage](src/admin/pages/PagesPage.tsx), [SeoPage](src/admin/pages/SeoPage.tsx)) to call the matching `adminRepository` function. After a successful save, refetch and re-dispatch `cms:update` so live preview keeps working.

### 7.4 Real forms

- Newsletter → `INSERT` into `newsletter_subscribers` (unique on email; treat a duplicate as success, don't leak that the address is already subscribed).
- Contact → `INSERT` into `contact_submissions` with `name, email, subject, message, status='new'`.
- Both need genuine loading / error / success states, replacing today's optimistic-only `setSubmitted(true)`.
- Add a CMS inbox page listing both, since the data now exists and is otherwise invisible.

### 7.5 Auth rewrite — `src/admin/auth/AuthContext.tsx`

Delete `CREDENTIALS`, `sha256()`, `generateToken()`, and the whole `sessionStorage` session scheme. Replace with:
- `login(username, password)` → resolve to `<username>@auth.anok.local` → `supabase.auth.signInWithPassword`.
- Session from `supabase.auth.getSession()` + `onAuthStateChange`. Supabase handles refresh; drop the 60-second polling interval.
- On session, fetch the caller's `profiles` row and expose `{ user, profile, role, isSuperadmin, isAuthenticated, loading, login, logout }`.
- `AdminRoute` gains an optional `requireSuperadmin` prop; while `loading` it renders a spinner, not a redirect (otherwise a page refresh bounces an authenticated user to `/login`).
- Handle "user exists but `is_active = false`" as a rejected login with a clear message.

### 7.6 New CMS pages

- **`/admin/users`** — superadmin-only. List profiles, create admin (username + password + full name), deactivate, delete, change role between `admin` and... nothing else. The "create superadmin" affordance must not exist in the UI, and the DB trigger backstops it.

  Creation goes through the `admin-create-user` edge function (§4), not a direct table insert — the browser has no service-role key. Deactivate/delete/rename are ordinary `profiles` writes gated by the superadmin policies.
- **`/admin/media`** — browse `media_assets`, upload, edit `alt` text, delete. Every image field in every existing form gets a picker that opens this.

  The uploader must run the **same optimisation and tiering as `ingest-media.ts`**, client-side, before anything is sent: re-encode to webp via `<canvas>`, cap the long edge at 1920px, then choose the tier by the resulting size. Show the editor what happened — *"2.4 MB → 180 KB, stored as file"* or *"18 KB, stored inline"* — so the tier is visible rather than mysterious. Refuse the upload with a clear message if the inline ceiling (§2C) would be exceeded, naming which assets are consuming it.

  Each asset row shows its tier, size, dimensions, and **how many content fields reference it**, so an editor can tell what is safe to delete. Deleting an in-use asset requires a confirmation that names the sections that will lose their image.
- **`/admin/inbox`** — contact submissions + newsletter subscribers.

Hide the Users nav item for non-superadmins **and** guard the route **and** rely on RLS. Three layers, because the first two are cosmetic.

### 7.7 One new shared component — `<Img>`

Add `src/components/ui/Img.tsx`, the single place images render. It takes the resolved `src` string the section types already carry, looks up the LQIP from the `media.lqip` map exposed by `get_site_data()`, and renders the blur first with the real image fading in over it. Also sets `loading="lazy"`, `decoding="async"`, and explicit `width`/`height` to prevent layout shift.

Swap the handful of existing `<img>` tags — [Newsletter.tsx:22](src/components/Newsletter.tsx#L22) and the commitment / about-strip / product-gallery images — over to it. Inline (`data:`) sources skip the blur path entirely; they are already present in the document and paint immediately.

This is small, but it is what converts §2C's LQIP column from stored bytes into visible benefit. Without it the blur placeholders are dead weight.

### 7.8 Deletions — the migration is not done until these are gone

- [ ] `public/cms-data.json`
- [ ] `cmsWritePlugin()` and its `fs`/`path` imports in [vite.config.ts](vite.config.ts)
- [ ] `writeStore` / `updateSection` from `siteRepository.ts`
- [ ] the `CREDENTIALS` constant and the `sha256` helper
- [ ] `public/images/*.webp` once ingested (keep `favicon.ico`, and keep `logo.png` only if `index.html` references it directly — check before deleting)
- [ ] any `AUDIT.md` / code-comment claim that content lives in a JSON file

Then run a final sweep: `grep -rn "cms-data\|__cms_write\|CREDENTIALS\|/images/" src/ public/ vite.config.ts` must return nothing but intentional hits. **This grep returning clean is the acceptance test for "Supabase is the only source of content."**

### 7.9 Types

`src/data/types.ts` stays the contract for the public site — `get_site_data()` returns exactly this shape. Add a separate `src/data/db.types.ts` (generate with `supabase gen types typescript`) for row-level admin operations. Do not merge the two: one is the view model, one is the storage model, and conflating them is what forces schema changes to ripple into 20 components.

---

## 8. Deliverable 6 — Deployment

- Cloudflare Workers static assets serve a pure client-side SPA; `VITE_*` vars are inlined at build time. Set them in the Cloudflare build environment (or `wrangler.jsonc` `vars` — but **only** the URL and anon key; the anon key is designed to be public, the service-role key never is).
- Confirm the anon key's blast radius is exactly the RLS matrix in §5. Write it down in the PR description.
- Document `npx supabase db push`, `npm run bootstrap`, `npm run ingest-media`, `npm run verify-migration` in the README.
- **Egress.** Storage-backed images are served from Supabase's CDN and cached immutably (§5), so each visitor pays for them once, not once per page view. This is the axis where the 5 GB-tier bandwidth allowance is actually consumed — capacity is not. If traffic ever makes egress material, the next step is fronting the bucket with Cloudflare (same account already serves the site), **not** moving images into the database.
- Note the SEO consequence: content is now client-fetched, so crawlers see an empty shell until JS runs. That is already true today (the JSON is fetched at runtime too), so this migration does not regress it — but flag SSR/prerendering as the follow-up it now clearly is.

---

## 9. Testing checklist

**Database**
- [ ] Anonymous client can read every content table and gets the full site.
- [ ] Anonymous client is **denied** on: any content write, `profiles` select, `contact_submissions` select, `newsletter_subscribers` select, `audit_log` select.
- [ ] Anonymous client **can** insert a contact submission and a newsletter signup.
- [ ] Anonymous read of `testimonials` returns only `visible = true` rows.
- [ ] `admin` can CRUD all content; `admin` is denied insert/update/delete on `profiles`.
- [ ] `superadmin` can create and delete an admin.
- [ ] Creating a `superadmin` via the anon/authenticated client **fails** (trigger fires).
- [ ] Deleting the last active superadmin **fails**.
- [ ] A user cannot escalate their own role.
- [ ] Storage: anon can read `media`, anon upload is denied, admin upload succeeds.

**Media tiering (§2C)**
- [ ] An asset ≤ 8 KB lands as `kind='inline'` with a populated `data_url` and no `storage_path`.
- [ ] An asset > 8 KB lands as `kind='object'` in Storage, with a populated `lqip` and no `data_url`.
- [ ] The `tier_consistent` CHECK rejects a row with both `data_url` and `storage_path`.
- [ ] The `inline_is_small` CHECK rejects a `data_url` over 28 000 bytes.
- [ ] The ceiling trigger rejects an insert that would push total inline bytes past 200 KB.
- [ ] Re-uploading an identical file reuses the existing row (checksum dedupe) rather than creating a second.
- [ ] Deleting an in-use asset nulls the reference and the affected section renders its empty state rather than a broken image.
- [ ] Storage objects come back with a long-lived `cache-control` header, and a second page load serves them from cache (not a fresh 200).

**Data fidelity**
- [ ] `verify-migration` reports 0 differences against the original JSON.
- [ ] All 7 business hours, 3 nav links, 4 reasons, 3 product images, 4 sizes, 3 highlights, 5 specs, 3 usage steps, 3 note layers, 3 testimonials, 4 pillars, 2 footer columns, 6 contact subjects, 7 privacy sections, 8 terms sections, 9 FAQ items are present **and in their original order**.

**Application**
- [ ] Every public page renders identically to pre-migration (`/`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`).
- [ ] With Supabase blocked (DevTools offline / bad URL), the site shows `SiteError` and **no content**. Nothing bundled leaks through.
- [ ] Login with the superadmin username/password works; a wrong password gives a generic error.
- [ ] A CMS edit persists **in production**, not just in `npm run dev` — this is the capability that does not exist today.
- [ ] Refreshing an `/admin` page keeps the session (no bounce to `/login`).
- [ ] An `admin` sees no Users nav item, and hitting `/admin/users` directly is refused.
- [ ] Newsletter and contact submissions actually land in the database.
- [ ] `npm run build` (i.e. `tsc && vite build`) passes with zero TypeScript errors.

**Performance budget — measure, do not assume**
- [ ] The `get_site_data()` response is **under 60 KB uncompressed**. Measure it in the Network tab and record the number in the PR. If it is in the hundreds of KB, the tiering has been implemented wrong — an image is inline that should be an object.
- [ ] Total transferred bytes for a cold homepage load are **no worse than pre-migration**. Compare against `main` before merging.
- [ ] A warm reload transfers substantially less, proving the images are actually being cached.

---

## 10. Acceptance criteria

1. `grep -rn "cms-data\|__cms_write\|CREDENTIALS" src/ public/ vite.config.ts` returns nothing.
2. `public/cms-data.json` does not exist in the working tree or in the build output.
3. Every rendered string and image on the public site is traceable to a Supabase row or object.
4. No plaintext password, service-role key, or `.env.local` value appears anywhere in git history added by this work.
5. RLS is enabled on every table in `public`, and §9's deny-list all pass.
6. The CMS saves content from the deployed production site.
7. The role matrix from the original brief is enforced by database policy, verified by test, not by UI alone.
8. `get_site_data()` returns under 60 KB, and the tiering constraints in §2C exist in the schema — not merely in the ingest script. A convention enforced only by a script is not enforced.
9. Total Supabase footprint (DB + Storage) after migration is reported in the PR. Expect well under 1 MB against the 5 GB quota.

---

## 11. Execution order

Do it in this order; each step is independently verifiable and the JSON stays intact as a reference until step 8.

1. Supabase project + env + client (`src/lib/supabase.ts`)
2. Migrations 0001–0015, applied locally via `supabase start`
3. `extract-seed.ts` → `seed.sql`; `ingest-media.ts` (optimise + tier + LQIP); apply
4. `bootstrap-superadmin.ts`; log in against real Supabase Auth
5. `verify-migration.ts` → **must report 0 differences**
6. Rewrite `siteRepository.ts`; confirm the public site renders from Supabase
7. `adminRepository.ts` + rewire all five admin pages; confirm production saves
8. **Now** delete the JSON, the Vite write plugin, the static images, and the hardcoded credentials
9. New pages: Users, Media, Inbox; the `<Img>` component; real Newsletter/Contact submissions
10. Run §9 in full, then §10

---

## 12. Things to raise rather than silently decide

If you hit any of these, stop and ask:

- **`testimonials.id` numeric → uuid.** Pick one and say so (§4).
- **`logo.png` / `anok-1.jpeg`** — if referenced from `index.html` rather than content, they stay static assets. Check before deleting.
- **Draft/publish workflow** is *not* in scope here; every CMS save goes live immediately, matching today's behaviour. If a review step is wanted, that is a `status` column and a second policy — say so before building it.
- **Multi-product.** The schema in §4 uses a `products` table with a `is_featured` flag rather than a singleton, so V2 can add products without a migration. If you prefer a strict singleton, say so — but the table-with-flag costs nothing now.
- **The 8 KB threshold** is a judgement call, tuned against a measured payload (see §2C). If the asset mix changes a lot, retune the constant — but revisit it deliberately, with the payload measured, rather than nudging it per-upload.
- **Responsive image variants** (`srcset` at 640/1280/1920) are not in scope. Supabase's on-the-fly image transformation is a paid-plan feature; the alternative is generating variants in `ingest-media.ts`, which triples the row count. Worth doing later if mobile performance demands it — flag it, don't build it now.
- **Rate limiting on anonymous inserts** is unaddressed. Cloudflare Turnstile in front of both forms is the natural fit given the hosting; treat it as a follow-up ticket, not scope creep into this migration.
