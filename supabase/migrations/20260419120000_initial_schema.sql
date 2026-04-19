-- DATA-CORE-ICON — initial schema for Supabase (Postgres)
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (role + directory fields)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text default '',
  role text not null default 'teacher' check (role in ('teacher', 'executive', 'admin')),
  department text default '',
  avatar_url text,
  workload_hours numeric(8, 2) default 0,
  academic_year_goals text default '',
  goal_achievement_percent smallint not null default 0 check (goal_achievement_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- goals
-- ---------------------------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);

-- ---------------------------------------------------------------------------
-- activities (portfolio / พอร์ตโฟลิโอ)
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid references public.goals (id) on delete set null,
  title text not null,
  category text not null default '',
  level text not null,
  activity_date date not null,
  evidence_url text,
  contribution_percent smallint not null default 25 check (contribution_percent between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists activities_user_id_idx on public.activities (user_id);
create index if not exists activities_goal_id_idx on public.activities (goal_id);

-- ---------------------------------------------------------------------------
-- resources + likes (for teaching hub)
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  file_url text not null default '',
  likes_count int not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists resources_creator_idx on public.resources (creator_id);

create table if not exists public.resource_likes (
  resource_id uuid not null references public.resources (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (resource_id, user_id)
);

-- Keep likes_count in sync
create or replace function public.bump_resource_likes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.resources set likes_count = likes_count + 1 where id = new.resource_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.resources set likes_count = greatest(0, likes_count - 1) where id = old.resource_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists tr_resource_likes_ai on public.resource_likes;
create trigger tr_resource_likes_ai
  after insert on public.resource_likes
  for each row execute function public.bump_resource_likes();

drop trigger if exists tr_resource_likes_ad on public.resource_likes;
create trigger tr_resource_likes_ad
  after delete on public.resource_likes
  for each row execute function public.bump_resource_likes();

-- ---------------------------------------------------------------------------
-- Goal progress % (SQL aggregation — 25% per linked activity, cap 100)
-- ---------------------------------------------------------------------------
create or replace function public.get_goals_with_progress(p_user_id uuid)
returns table (
  goal_id uuid,
  category text,
  description text,
  created_at timestamptz,
  progress_percent int
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    g.id as goal_id,
    g.category,
    g.description,
    g.created_at,
    least(100, (count(a.id) * 25)::int) as progress_percent
  from public.goals g
  left join public.activities a on a.goal_id = g.id and a.user_id = g.user_id
  where g.user_id = p_user_id
  group by g.id, g.category, g.description, g.created_at;
$$;

grant execute on function public.get_goals_with_progress(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- New user → profile row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, department)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    case
      when new.raw_user_meta_data->>'role' in ('teacher', 'executive', 'admin')
      then new.raw_user_meta_data->>'role'
      else 'teacher'
    end,
    coalesce(new.raw_user_meta_data->>'department', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.activities enable row level security;
alter table public.resources enable row level security;
alter table public.resource_likes enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- goals
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);

drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);

drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);

drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- activities
drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own" on public.activities for select using (auth.uid() = user_id);

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own" on public.activities for insert with check (auth.uid() = user_id);

drop policy if exists "activities_update_own" on public.activities;
create policy "activities_update_own" on public.activities for update using (auth.uid() = user_id);

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own" on public.activities for delete using (auth.uid() = user_id);

-- resources (readable by any signed-in user; writes restricted)
drop policy if exists "resources_select_auth" on public.resources;
create policy "resources_select_auth" on public.resources for select to authenticated using (true);

drop policy if exists "resources_insert_creator" on public.resources;
create policy "resources_insert_creator" on public.resources for insert to authenticated with check (auth.uid() = creator_id);

drop policy if exists "resources_update_creator" on public.resources;
create policy "resources_update_creator" on public.resources for update to authenticated using (auth.uid() = creator_id);

drop policy if exists "resources_delete_creator" on public.resources;
create policy "resources_delete_creator" on public.resources for delete to authenticated using (auth.uid() = creator_id);

-- resource_likes
drop policy if exists "resource_likes_select_own" on public.resource_likes;
create policy "resource_likes_select_own" on public.resource_likes for select to authenticated using (true);

drop policy if exists "resource_likes_insert_own" on public.resource_likes;
create policy "resource_likes_insert_own" on public.resource_likes for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "resource_likes_delete_own" on public.resource_likes;
create policy "resource_likes_delete_own" on public.resource_likes for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: public bucket for avatars (create bucket in Dashboard if insert fails)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects for update to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects for delete to authenticated using (
  bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
);
