# ANOK Database

## Quick Start

### 1. Set up environment
```bash
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 2. Run migrations (Supabase)
```bash
npm run migrate:supabase
```

### 3. Seed initial data
```bash
npm run seed
```

---

## All Commands

| Command | Description |
|---|---|
| `npm run migrate:supabase` | Run all pending Supabase migrations |
| `npm run migrate:postgres` | Run all pending Postgres migrations |
| `npm run migrate:mysql` | Run all pending MySQL migrations |
| `npm run migrate:up` | Run for DB_PROVIDER set in .env |
| `npm run migrate:down` | Rollback last migration |
| `npm run migrate:status` | Show applied / pending migrations |
| `npm run migrate:dry-run` | Print SQL without executing |
| `npm run seed` | Insert initial content and products |
| `npm run db:reset` | Rollback all → migrate → seed |

---

## Folder Structure

```
database/
├── migrations/
│   ├── supabase/        ← Supabase SQL (with RLS policies)
│   │   └── rollbacks/   ← Rollback files
│   ├── postgres/        ← Standalone PostgreSQL
│   └── mysql/           ← MySQL 8.0+
├── seeds/               ← Initial data from siteContent.ts
├── schema/
│   └── schema.dbml      ← Paste into dbdiagram.io for ERD
└── migration_runner/    ← TypeScript migration manager
```

---

## Migration Execution Order (Supabase)

| File | Description |
|---|---|
| `001_create_extensions` | uuid-ossp, pgcrypto, citext |
| `002_create_users_profiles` | Supabase Auth + profiles table + triggers |
| `003_create_site_content` | CMS sections (replaces localStorage) |
| `004_create_products` | Product catalogue |
| `005_create_testimonials` | Customer reviews |
| `006_create_newsletter` | Email subscribers |
| `007_create_orders` | Orders + order items |
| `008_create_addresses` | Customer shipping addresses |
| `009_create_migration_history` | Migration tracking table |
| `010_create_indexes` | Full-text search + composite indexes |
| `011_create_rls_policies` | Row Level Security for all tables |

---

## Switching Databases

The Worker API is fully abstracted via `src/api/db/index.ts`.
To switch from Supabase to raw Postgres:
1. Implement `src/api/db/postgres.ts` (same interface as `supabase.ts`)
2. In `src/worker.ts`, change `new SupabaseClient(env)` to `new PostgresClient(env)`
3. Set `DB_PROVIDER=postgres` in your environment

No route changes. No type changes. No frontend changes.

---

## Cloudflare Worker Secrets

Set via `wrangler secret put` for production:
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put WHATSAPP_PHONE
```

For local dev, use `.dev.vars` (copied from `.dev.vars.example`).



-----------------
Everything is exactly as planned. Here's a complete summary of what was built:

What Was Delivered
Database migrations (Supabase — primary)
11 migration files in strict execution order:

002 — Supabase Auth integration + profiles table with user_type enum (customer/admin) + auto-create trigger on signup
003 — site_content table replacing localStorage, JSONB per section
004 — products with Postgres arrays for fragrance notes, integer NPR prices, full-text search vector
005–006 — testimonials + newsletter_subscribers with GDPR audit fields
007 — orders + order_items with price snapshots, order number generator (ANOK-2026-00001)
008 — customer_addresses with single-default enforcement trigger
009 — migration_history tracking table
010 — Composite indexes + GIN full-text search
011 — RLS policies: anon reads public content, customers own their data, admins get full access
Equivalent schemas for Postgres + MySQL (same logical structure)
3 seed files — all current hardcoded data migrated to SQL
Cloudflare Worker API (
worker.ts
)
Routes: /api/cms, /api/products, /api/orders, /api/newsletter

Supabase JWT auth via verifyToken() / requireAdmin()
Database abstraction interface — one line change to switch providers
WhatsApp utility (
whatsapp.ts
)
Builds the formatted message and opens wa.me/{phone}?text=... when a guest taps Order

All npm scripts
migrate:supabase, migrate:up/down/status, seed, db:reset, migrate:dry-run

Next step when you're ready: connect your Supabase project — copy .dev.vars.example to .dev.vars, fill in your Supabase URL and keys, then run npm run migrate:supabase followed by npm run seed. That's the entire first deployment.