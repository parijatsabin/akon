-- Rollback: 009 → 001 (full schema teardown)
-- Run this to completely remove all ANOK tables and types.
-- ORDER MATTERS — drop dependents before parents.

DROP TABLE IF EXISTS public.migration_history      CASCADE;
DROP TABLE IF EXISTS public.customer_addresses     CASCADE;
DROP TABLE IF EXISTS public.order_items            CASCADE;
DROP TABLE IF EXISTS public.orders                 CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.testimonials           CASCADE;
DROP TABLE IF EXISTS public.products               CASCADE;
DROP TABLE IF EXISTS public.site_content           CASCADE;
DROP TABLE IF EXISTS public.profiles               CASCADE;

DROP SEQUENCE  IF EXISTS order_number_seq;

DROP FUNCTION  IF EXISTS public.generate_order_number();
DROP FUNCTION  IF EXISTS public.enforce_single_default_address();
DROP FUNCTION  IF EXISTS public.set_updated_at();
DROP FUNCTION  IF EXISTS public.handle_new_user();

DROP TRIGGER   IF EXISTS on_auth_user_created             ON auth.users;

DROP TYPE      IF EXISTS order_status;
DROP TYPE      IF EXISTS product_collection;
DROP TYPE      IF EXISTS user_type;
