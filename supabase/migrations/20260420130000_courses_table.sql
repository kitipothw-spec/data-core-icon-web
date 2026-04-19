-- Central training courses (admin CRUD)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cover_url text not null default '',
  category text not null default '',
  apply_range text not null default '',
  training_range text not null default '',
  link text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists courses_category_idx on public.courses (category);
