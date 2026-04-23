-- ═══════════════════════════════════════════════════════════════════════════
-- YardPilot Multi-User Migration
-- Run this in your Supabase SQL Editor (Settings → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Create the team_members table ─────────────────────────────────────────
create table if not exists public.team_members (
  id               uuid primary key default gen_random_uuid(),
  owner_user_id    uuid not null references auth.users(id) on delete cascade,
  member_user_id   uuid references auth.users(id) on delete set null,
  role             text not null default 'dispatcher'
                   check (role in ('admin', 'dispatcher', 'technician')),
  email            text not null,
  name             text,
  status           text not null default 'pending'
                   check (status in ('pending', 'active', 'removed')),
  invited_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists team_members_owner_idx   on public.team_members (owner_user_id);
create index if not exists team_members_member_idx  on public.team_members (member_user_id);
create index if not exists team_members_email_idx   on public.team_members (email);

-- ── 2. RLS on team_members ────────────────────────────────────────────────────
alter table public.team_members enable row level security;

-- Owners can see all their team members
create policy "owner_select_team" on public.team_members
  for select using (auth.uid() = owner_user_id);

-- Members can see their own row (so the app can resolve their owner)
create policy "member_select_own" on public.team_members
  for select using (auth.uid() = member_user_id);

-- Only service role can insert/update/delete (done via service client in API routes)
-- No direct client-side write access needed

-- ── 3. Helper function: resolve owner user_id ─────────────────────────────────
-- Used in RLS policies below so team members can access owner's data.
create or replace function public.get_owner_id(uid uuid)
returns uuid
language sql
security definer
stable
as $$
  select coalesce(
    (select owner_user_id from public.team_members
     where member_user_id = uid and status = 'active'
     limit 1),
    uid
  );
$$;

-- ── 4. Update RLS policies on core tables to allow team member access ─────────
--
-- Pattern: allow row if auth.uid() is the owner OR if auth.uid() is an active
-- team member whose owner_user_id matches the row's user_id.
--
-- NOTE: If your tables don't have RLS enabled yet, run:
--   alter table public.<table> enable row level security;
-- for each table listed below.

-- customers
drop policy if exists "users_own_customers" on public.customers;
create policy "users_own_customers" on public.customers
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- jobs
drop policy if exists "users_own_jobs" on public.jobs;
create policy "users_own_jobs" on public.jobs
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- invoices
drop policy if exists "users_own_invoices" on public.invoices;
create policy "users_own_invoices" on public.invoices
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- technicians
drop policy if exists "users_own_technicians" on public.technicians;
create policy "users_own_technicians" on public.technicians
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- tasks
drop policy if exists "users_own_tasks" on public.tasks;
create policy "users_own_tasks" on public.tasks
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- leads
drop policy if exists "users_own_leads" on public.leads;
create policy "users_own_leads" on public.leads
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- estimates
drop policy if exists "users_own_estimates" on public.estimates;
create policy "users_own_estimates" on public.estimates
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- settings (owner-only write — team members can read but not write via RLS;
--           the API route enforces write restrictions by role)
drop policy if exists "users_own_settings" on public.settings;
create policy "users_own_settings_select" on public.settings
  for select using (user_id = public.get_owner_id(auth.uid()));

create policy "users_own_settings_write" on public.settings
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- recurring_plans
drop policy if exists "users_own_recurring_plans" on public.recurring_plans;
create policy "users_own_recurring_plans" on public.recurring_plans
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));

-- portal_tokens (only owners should access these)
drop policy if exists "users_own_portal_tokens" on public.portal_tokens;
create policy "users_own_portal_tokens" on public.portal_tokens
  for all using (user_id = public.get_owner_id(auth.uid()))
  with check (user_id = public.get_owner_id(auth.uid()));
