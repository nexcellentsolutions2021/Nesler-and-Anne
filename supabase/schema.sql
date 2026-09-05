-- Run this once in Supabase: Project → SQL Editor → New query → Run.

create table if not exists guests (
  id text primary key,
  name1 text not null,
  status1 text default '',
  companions jsonb default '[]'::jsonb,   -- array of up to 19 { "name": "", "status": "" } objects, for guest 2..20
  companion_count integer default 0,
  mode text default 'Open',               -- 'Open' or 'Fixed'
  total_attending integer default 0,
  submitted boolean default false,
  submitted_at timestamptz,
  allergies text default ''
);

create table if not exists settings (
  key text primary key,
  value text
);

insert into settings (key, value) values ('rsvp_active', 'true')
on conflict (key) do nothing;

-- Row Level Security stays off / default here on purpose: the app only ever
-- talks to Supabase using the service_role key from inside Vercel's
-- serverless functions (never from the guest's or admin's browser), so RLS
-- policies aren't needed for this project to be safe.
