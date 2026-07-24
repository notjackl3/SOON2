-- Waitlist capture for the hero email CTA (src/components/ui/email-cta.tsx).
-- Stores one row per address. The public site inserts with the anon key, so
-- RLS allows anon INSERT only — nobody can read the list back through the API.

create table if not exists public.waitlist (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness so "A@x.com" and "a@x.com" collide. A duplicate
-- insert raises 23505, which the client treats as "already signed up".
create unique index if not exists waitlist_email_lower_key
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Anyone hitting the public API may add themselves, and nothing else. Scoped to
-- `public` (rather than just `anon`) so it applies no matter which public key
-- type the client uses — legacy anon JWT or the newer sb_publishable_ key, which
-- can resolve to a different role. No select/update/delete policy exists, so
-- reads and mutations remain denied for every non-service key.
drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to public
  with check (true);
