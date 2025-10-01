-- Create badges table
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon_url text,
  points_required integer default 0,
  rarity text default 'common',
  created_at timestamp with time zone default now()
);

-- Create user_badges table
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

-- Create points_history table
create table if not exists public.points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.points_history enable row level security;

-- RLS Policies for badges (everyone can read)
create policy "badges_select_all"
  on public.badges for select
  using (true);

-- RLS Policies for user_badges
create policy "user_badges_select_own"
  on public.user_badges for select
  using (auth.uid() = user_id);

create policy "user_badges_insert_own"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

-- RLS Policies for points_history
create policy "points_select_own"
  on public.points_history for select
  using (auth.uid() = user_id);

create policy "points_insert_own"
  on public.points_history for insert
  with check (auth.uid() = user_id);
