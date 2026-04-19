-- Executive dashboard: read aggregated data across all teachers (avoids RLS recursion via SECURITY DEFINER helper).

create or replace function public.auth_is_executive()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'executive'
  );
$$;

grant execute on function public.auth_is_executive() to authenticated;

drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (
  auth.uid() = user_id or public.auth_is_executive()
);

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own" on public.activities for select using (
  auth.uid() = user_id or public.auth_is_executive()
);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (
  auth.uid() = id or public.auth_is_executive()
);
