# ANOK — Project Setup Guide

## Architecture Overview

```
Browser (React SPA)
    │
    ├── /          → Public Site  (reads from /api/cms, /api/products)
    ├── /admin/*   → Admin Panel  (reads/writes via /api/cms, /api/products)
    │
    └── /api/*     → Cloudflare Worker (API layer)
                        │
                        └── Supabase Postgres (database)
```

---

## Step 1: Get Your Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/cgwptrjlybjrzcnxmwfm/settings/api
2. Copy the **`service_role`** key (NOT the anon key)
3. See `database/scripts/get_service_role_key.md` for full instructions

---

## Step 2: Configure Local Environment

Copy the example files and fill in your keys:

```bash
# Worker secrets (used by `wrangler dev`)
copy .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```
SUPABASE_URL=https://cgwptrjlybjrzcnxmwfm.supabase.co
SUPABASE_ANON_KEY=sb_publishable_WWS8K9a5BJ6u_50fx0wziQ_nlBSwIfc
SUPABASE_SERVICE_ROLE_KEY=eyJ...YOUR_SERVICE_ROLE_KEY...
WHATSAPP_PHONE=+9779868765432
```

The `.env` file (for Vite + migration runner) is already configured:
```
VITE_SUPABASE_URL=https://cgwptrjlybjrzcnxmwfm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_WWS8K9a5BJ6u_50fx0wziQ_nlBSwIfc
VITE_API_URL=
DB_PROVIDER=supabase
```

---

## Step 3: Create the First Admin User

Run this in the Supabase SQL Editor:
https://supabase.com/dashboard/project/cgwptrjlybjrzcnxmwfm/sql/new

Copy and run: `database/scripts/create_admin_user.sql`

**Change the email and password before running.**

Default credentials in the script:
- Email: `admin@anok.fragrance`
- Password: `ChangeMe@2026!`

---

## Step 4: Run Database Migrations (if not done via SQL Editor)

```bash
# Copy env for migration runner
copy .env.example .env
# Fill in SUPABASE_SERVICE_ROLE_KEY in .env

# Run all migrations
npm run migrate:supabase

# Check status
npm run migrate:status

# Seed initial content + products
npm run seed
```

---

## Step 5: Install Dependencies

```bash
npm install
```

---

## Step 6: Local Development

Two terminals needed:

**Terminal 1 — Vite dev server (React frontend):**
```bash
npm run dev
# Opens at http://localhost:3000
```

**Terminal 2 — Wrangler dev server (Worker API):**
```bash
npx wrangler dev
# Worker runs at http://localhost:8787
```

Then set in `.env`:
```
VITE_API_URL=http://localhost:8787
```

> **Note:** In production (deployed to Cloudflare), the Worker and the
> static site are on the same origin, so `VITE_API_URL` is empty.

---

## Step 7: Deploy to Cloudflare

```bash
# Set production secrets first (one-time):
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put WHATSAPP_PHONE

# Deploy:
npm run deploy
```

---

## Admin Panel

URL: `https://your-domain.com/admin`

Login with the credentials you set in Step 3.

**Admin can manage:**
- Brand settings (name, contact, hours, social links)
- Hero section
- Stats bar
- About section
- Commitment section
- Newsletter section
- Navigation links
- Footer
- Product collection
- Testimonials

**All saves dual-write:**
- → Supabase database (persistent, multi-device)
- → localStorage (instant UI, offline fallback)

---

## WhatsApp Orders

When a visitor clicks "Order Now" on any product without being logged in,
they are redirected to WhatsApp with a pre-filled message:

```
Hi ANOK 👋

I'm interested in ordering:

🌸 *Noir Veil* — Signature Collection
💰 NPR 24,500

Please help me complete my purchase.
```

WhatsApp number is configured via `WHATSAPP_PHONE` environment variable.

---

## Database Schemas

- **Supabase** (primary): `database/migrations/supabase/`
- **PostgreSQL** (standalone): `database/migrations/postgres/`
- **MySQL**: `database/migrations/mysql/`

ERD diagram: paste `database/schema/schema.dbml` into https://dbdiagram.io

---

## Switching Databases

The Worker API is fully abstracted via `src/api/db/index.ts`.
To switch from Supabase to another provider:

1. Implement `src/api/db/postgres.ts` or `src/api/db/mysql.ts`
2. In `src/worker.ts`, change one line:
   ```ts
   // Change this:
   const db = new SupabaseClient(env);
   // To this:
   const db = new PostgresClient(env);
   ```
3. Update `.dev.vars` with the new connection details
4. Run migrations for the new provider

No route changes. No frontend changes. No type changes.

---

## Future Mobile App

The Worker API is REST-based and ready for mobile:
- `POST /api/auth/login` — authenticate (via Supabase)
- `GET  /api/products`  — product catalogue
- `POST /api/orders`    — place an order
- `GET  /api/orders/mine` — customer order history

Same Supabase project, same `user_type` system.
Customers created on web work on mobile and vice versa.
