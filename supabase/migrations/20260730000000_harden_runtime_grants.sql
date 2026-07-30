-- Invictus Trading Academy - runtime grants hardening
-- Keeps RLS policies as the row-level authority and grants only the table
-- privileges needed by Supabase runtime roles.

-- Remove inherited or accidental table privileges from client roles.
revoke all privileges on table public.profiles
  from anon, authenticated;
revoke all privileges on table public.products
  from anon, authenticated;
revoke all privileges on table public.enrollments
  from anon, authenticated;
revoke all privileges on table public.module_progress
  from anon, authenticated;
revoke all privileges on table public.admin_users
  from anon, authenticated;
revoke all privileges on table public.academy_modules
  from anon, authenticated;
revoke all privileges on table public.academy_module_videos
  from anon, authenticated;
revoke all privileges on table public.academy_resources
  from anon, authenticated;
revoke all privileges on table public.purchases
  from anon, authenticated;
revoke all privileges on table public.purchase_events
  from anon, authenticated;
revoke all privileges on table public.stripe_webhook_events
  from anon, authenticated;

-- Public visitors do not read private academy, profile, enrollment or
-- commercial tables directly.

-- Authenticated students and admins read through existing RLS policies.
grant select on table public.profiles
  to authenticated;
grant select on table public.products
  to authenticated;
grant select on table public.enrollments
  to authenticated;
grant select on table public.admin_users
  to authenticated;
grant select on table public.academy_modules
  to authenticated;
grant select on table public.academy_module_videos
  to authenticated;
grant select on table public.academy_resources
  to authenticated;
grant select on table public.purchases
  to authenticated;
grant select on table public.purchase_events
  to authenticated;

-- Existing non-commercial write surfaces remain controlled by RLS policies.
grant insert, update on table public.module_progress
  to authenticated;
grant select on table public.module_progress
  to authenticated;
grant insert, update on table public.enrollments
  to authenticated;
grant update on table public.academy_modules
  to authenticated;
grant insert, update, delete on table public.academy_module_videos
  to authenticated;
grant insert, update, delete on table public.academy_resources
  to authenticated;

-- Commercial writes remain server-side only. Authenticated users do not receive
-- direct INSERT/UPDATE/DELETE on purchases, purchase_events or webhook events.

-- The service_role is the administrative server role. It bypasses RLS in
-- Supabase and needs explicit SQL privileges for server-side operations.
grant select, insert, update, delete on table public.profiles
  to service_role;
grant select, insert, update, delete on table public.products
  to service_role;
grant select, insert, update, delete on table public.enrollments
  to service_role;
grant select, insert, update, delete on table public.module_progress
  to service_role;
grant select, insert, update, delete on table public.admin_users
  to service_role;
grant select, insert, update, delete on table public.academy_modules
  to service_role;
grant select, insert, update, delete on table public.academy_module_videos
  to service_role;
grant select, insert, update, delete on table public.academy_resources
  to service_role;
grant select, insert, update, delete on table public.purchases
  to service_role;
grant select, insert, update, delete on table public.purchase_events
  to service_role;
grant select, insert, update, delete on table public.stripe_webhook_events
  to service_role;

-- Purchase numbers are generated only by server-side purchase inserts.
revoke all privileges on sequence public.purchase_number_seq
  from anon, authenticated;
grant usage, select, update on sequence public.purchase_number_seq
  to service_role;
