-- =============================================================================
-- Supabase "Before User Created" Auth Hook
-- =============================================================================
-- This function is registered as a "Before User Created" hook in the Supabase
-- dashboard (Authentication → Hooks). It fires for EVERY provider (email/password,
-- Google OAuth, etc.) BEFORE a row is inserted into auth.users.
--
-- Purpose: Only allow emails ending with @bitsathy.ac.in (plus one hardcoded
-- admin account). All other domains are rejected with a 403.
--
-- To apply:
--   1. Run this SQL in the Supabase SQL Editor.
--   2. Go to Authentication → Hooks → Enable "Before User Created".
--   3. Select type: Postgres Function.
--   4. Select function: restrict_signup_to_college_domain.
--   5. Save.
--
-- To add a second allowed domain in the future (e.g. for staff):
--   Add another IF branch: if user_email like '%@newdomain.edu' then return '{}'::jsonb; end if;
-- =============================================================================

create or replace function public.restrict_signup_to_college_domain(event jsonb)
returns jsonb
language plpgsql
security definer
as $$
declare
  user_email text;
begin
  user_email := lower(event->'user'->>'email');

  -- Reject if no email provided
  if user_email is null or user_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'A valid email address is required.'
      )
    );
  end if;

  -- Allow the seeded admin account
  if user_email = 'admin@promptbench.dev' then
    return '{}'::jsonb;
  end if;

  -- Allow any @bitsathy.ac.in email (already lowercased above)
  if user_email like '%@bitsathy.ac.in' then
    return '{}'::jsonb;
  end if;

  -- Reject everything else
  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Only college emails ending with @bitsathy.ac.in are allowed.'
    )
  );
end;
$$;

-- Grant execute only to supabase_auth_admin (the role Supabase Auth uses internally)
grant execute on function public.restrict_signup_to_college_domain to supabase_auth_admin;

-- Revoke from all other roles to prevent unauthorized calls
revoke execute on function public.restrict_signup_to_college_domain from authenticated, anon, public;
