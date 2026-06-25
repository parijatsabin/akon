-- Rollback: 010_create_indexes
DROP INDEX IF EXISTS public.idx_products_search;
DROP INDEX IF EXISTS public.idx_products_active_sorted;
DROP INDEX IF EXISTS public.idx_orders_status_created;
DROP INDEX IF EXISTS public.idx_orders_customer_created;
DROP INDEX IF EXISTS public.idx_site_content_gin;
ALTER TABLE public.products DROP COLUMN IF EXISTS search_vector;
