# How to get your Supabase Service Role Key

The service role key is needed for:
- The Cloudflare Worker (`.dev.vars` + wrangler secrets)
- The migration runner (`database/.env`)

## Steps

1. Go to: https://supabase.com/dashboard/project/cgwptrjlybjrzcnxmwfm/settings/api
2. Scroll to **Project API keys**
3. Copy the **`service_role`** key (click the eye icon to reveal it)
4. It starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Where to put it

### Local development — `.dev.vars`
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_key_here...
```

### Production — Cloudflare Worker secret
```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# paste key when prompted
```

### Migration runner — `.env` (in project root)
```
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_key_here...
```

## ⚠️ WARNING
- NEVER commit the service role key to git
- NEVER expose it in frontend/browser code
- It bypasses all Row Level Security policies
- Treat it like a database root password
