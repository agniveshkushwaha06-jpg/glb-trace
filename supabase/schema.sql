-- GLB Trace database. Paste this whole file into Supabase SQL Editor and run it.
-- Safe to run again when upgrading an existing GLB Trace database.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  roll_no text,
  admission_no text,
  year text,
  section text,
  phone text,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost','found')),
  title text not null,
  category text not null,
  description text,
  location text not null,
  item_date date not null default current_date,
  image_url text,
  status text not null default 'open' check (status in ('open','resolved')),
  reported_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.items add column if not exists verification_question text;
create index if not exists items_type_idx on public.items(type);
create index if not exists items_category_idx on public.items(category);
create index if not exists items_status_idx on public.items(status);

create table if not exists public.item_secrets (
  item_id uuid primary key references public.items(id) on delete cascade,
  answer text not null
);
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  answer text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique(item_id, claimant_id)
);
create index if not exists claims_item_status_idx on public.claims(item_id, status);

-- RLS cannot see other students' claims; this trusted trigger prevents claiming after approval.
create or replace function public.guard_claim_submission()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.claims c where c.item_id = new.item_id and c.status = 'approved') then
    raise exception 'This item already has an approved claim';
  end if;
  return new;
end $$;
drop trigger if exists guard_claim_submission on public.claims;
create trigger guard_claim_submission before insert on public.claims
for each row execute function public.guard_claim_submission();

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(item_id, reporter_id)
);
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '[]'::jsonb
);
insert into public.app_settings(key, value)
values ('admin_emails', coalesce(nullif(current_setting('app.settings.admin_emails', true), ''), '[]')::jsonb)
on conflict (key) do nothing;

-- Explicit API grants; RLS below decides which rows each signed-in student may use.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.items to authenticated;
grant select, insert on public.item_secrets to authenticated;
grant select, insert on public.claims to authenticated;
grant select, insert on public.reports to authenticated;

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.item_secrets enable row level security;
alter table public.claims enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "items readable by authenticated" on public.items;
create policy "items readable by authenticated" on public.items for select to authenticated using (true);
drop policy if exists "users insert own items" on public.items;
create policy "users insert own items" on public.items for insert to authenticated with check (auth.uid() = reported_by);
drop policy if exists "users update own items" on public.items;
-- Item status changes happen only through the owner-checked mark_returned RPC.
drop policy if exists "users delete own items" on public.items;
create policy "users delete own items" on public.items for delete to authenticated using (auth.uid() = reported_by);

drop policy if exists "owners read item secrets" on public.item_secrets;
create policy "owners read item secrets" on public.item_secrets for select to authenticated
  using (exists (select 1 from public.items i where i.id = item_id and i.reported_by = auth.uid()));
drop policy if exists "owners add item secrets" on public.item_secrets;
create policy "owners add item secrets" on public.item_secrets for insert to authenticated
  with check (exists (select 1 from public.items i where i.id = item_id and i.reported_by = auth.uid()));

drop policy if exists "parties read claims" on public.claims;
create policy "parties read claims" on public.claims for select to authenticated
  using (claimant_id = auth.uid() or exists (select 1 from public.items i where i.id = item_id and i.reported_by = auth.uid()));
drop policy if exists "users submit own claims" on public.claims;
create policy "users submit own claims" on public.claims for insert to authenticated
  with check (claimant_id = auth.uid() and exists (
    select 1 from public.items i
    where i.id = item_id and i.reported_by <> auth.uid() and i.status = 'open' and i.type = 'found'
  ));
-- The guard_claim_submission SECURITY DEFINER trigger above checks for an existing
-- approved claim. Do not query claims from this table's own RLS policy: that recurses.

drop policy if exists "reporters read reports" on public.reports;
create policy "reporters read reports" on public.reports for select to authenticated using (reporter_id = auth.uid());
drop policy if exists "users create reports" on public.reports;
create policy "users create reports" on public.reports for insert to authenticated with check (reporter_id = auth.uid());

create or replace function public.is_app_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select value ? (select lower(email) from auth.users where id = auth.uid())
    from public.app_settings where key = 'admin_emails'), false)
$$;

create or replace function public.decide_claim(p_claim_id uuid, p_approve boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_claim public.claims; v_owner uuid;
begin
  select c.* into v_claim from public.claims c where c.id = p_claim_id for update;
  if not found then raise exception 'Claim not found'; end if;
  -- Serialize decisions for one item so two concurrent approvals cannot both win.
  perform id from public.items where id = v_claim.item_id for update;
  select reported_by into v_owner from public.items where id = v_claim.item_id;
  if v_owner <> auth.uid() then raise exception 'Only the reporter can decide this claim'; end if;
  if v_claim.status <> 'pending' then raise exception 'This claim has already been decided'; end if;
  if p_approve then
    if exists (select 1 from public.claims where item_id = v_claim.item_id and status = 'approved') then
      raise exception 'Another claim has already been approved';
    end if;
    update public.claims set status = 'rejected', decided_at = now()
      where item_id = v_claim.item_id and id <> p_claim_id and status = 'pending';
    update public.claims set status = 'approved', decided_at = now() where id = p_claim_id;
  else
    update public.claims set status = 'rejected', decided_at = now() where id = p_claim_id;
  end if;
end $$;

create or replace function public.mark_returned(p_item_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.items set status = 'resolved'
  where id = p_item_id and reported_by = auth.uid() and status = 'open'
    and exists (select 1 from public.claims c where c.item_id = p_item_id and c.status = 'approved');
  if not found then raise exception 'An approved claim is required before marking returned'; end if;
end $$;

create or replace function public.get_claim_contact(p_item_id uuid)
returns table(role text, name text, roll_no text, year text, section text, email text, phone text)
language sql stable security definer set search_path = public as $$
  select case when p.id = i.reported_by then 'Reporter' else 'Claimant' end,
    p.name, p.roll_no, p.year, p.section, p.email, p.phone
  from public.claims c join public.items i on i.id = c.item_id
  join public.profiles p on p.id in (i.reported_by, c.claimant_id)
  where c.item_id = p_item_id and c.status = 'approved'
    and auth.uid() in (i.reported_by, c.claimant_id)
$$;

create or replace function public.admin_stats()
returns table(total_items bigint, returned_items bigint, total_users bigint, reported_posts bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_app_admin() then raise exception 'Admin access required'; end if;
  return query select (select count(*) from public.items),
    (select count(*) from public.items where status = 'resolved'),
    (select count(*) from public.profiles),
    (select count(*) from public.reports);
end $$;

create or replace function public.admin_remove_item(p_item_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_app_admin() then raise exception 'Admin access required'; end if;
  delete from public.items where id = p_item_id;
end $$;

create or replace function public.admin_list_items()
returns table(id uuid, title text, item_type text, category text, location text, status text, reports bigint, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_app_admin() then raise exception 'Admin access required'; end if;
  return query select i.id, i.title, i.type, i.category, i.location, i.status,
    (select count(*) from public.reports r where r.item_id = i.id), i.created_at
    from public.items i order by (select count(*) from public.reports r where r.item_id = i.id) desc, i.created_at desc;
end $$;

grant execute on function public.decide_claim(uuid, boolean) to authenticated;
grant execute on function public.mark_returned(uuid) to authenticated;
grant execute on function public.get_claim_contact(uuid) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_remove_item(uuid) to authenticated;
grant execute on function public.admin_list_items() to authenticated;
revoke all on function public.is_app_admin() from public, anon, authenticated;
revoke all on function public.guard_claim_submission() from public, anon, authenticated;
revoke all on function public.decide_claim(uuid, boolean) from public, anon;
revoke all on function public.mark_returned(uuid) from public, anon;
revoke all on function public.get_claim_contact(uuid) from public, anon;
revoke all on function public.admin_stats() from public, anon;
revoke all on function public.admin_remove_item(uuid) from public, anon;
revoke all on function public.admin_list_items() from public, anon;
grant execute on function public.decide_claim(uuid, boolean) to authenticated;
grant execute on function public.mark_returned(uuid) to authenticated;
grant execute on function public.get_claim_contact(uuid) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.admin_remove_item(uuid) to authenticated;
grant execute on function public.admin_list_items() to authenticated;

-- Create the public item-images bucket once in Supabase Storage, then run this upload policy.
-- Public buckets allow file reads by URL; no broad SELECT policy is needed to serve images.
drop policy if exists "anyone can view images" on storage.objects;
drop policy if exists "authenticated can upload images" on storage.objects;
create policy "authenticated can upload images" on storage.objects for insert to authenticated
  with check (bucket_id = 'item-images' and (storage.foldername(name))[1] = auth.uid()::text);
