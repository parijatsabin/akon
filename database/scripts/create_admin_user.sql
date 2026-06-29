-- ============================================================
-- Create First Admin User
-- ============================================================
-- Run this in:
--   Supabase Dashboard → SQL Editor
--   https://supabase.com/dashboard/project/cgwptrjlybjrzcnxmwfm/sql/new
--
-- HOW IT WORKS:
--   1. Creates the user in auth.users via Supabase's internal function
--   2. The on_auth_user_created trigger fires automatically and
--      inserts a row into public.profiles
--   3. We then UPDATE that profile row to set user_type = 'admin'
--
-- Change the email and password below before running.
-- ============================================================

-- Step 1: Create the auth user
-- (uses Supabase's internal auth schema function)
SELECT auth.create_user(
  '{
    "email":    "admin@anok.fragrance",
    "password": "ChangeMe@2026!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "ANOK",
      "last_name":  "Admin",
      "user_type":  "admin"
    }
  }'::jsonb
);

-- Step 2: Promote to admin
-- (the trigger creates the profile as 'customer' from raw_user_meta_data,
--  but let's be explicit and ensure it's set to admin)
UPDATE public.profiles
SET user_type = 'admin'
WHERE id = (
    SELECT id FROM auth.users
    WHERE email = 'admin@anok.fragrance'
    LIMIT 1
);

-- Verify
SELECT
    u.email,
    p.user_type,
    p.is_active,
    p.created_at
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@anok.fragrance';
