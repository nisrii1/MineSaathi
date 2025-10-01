-- Create emergency contacts table
create table if not exists public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  relationship text,
  phone text not null,
  is_primary boolean default false,
  created_at timestamp with time zone default now()
);

-- Create wellness check-ins table
create table if not exists public.wellness_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  stress_level integer,
  notes text,
  created_at timestamp with time zone default now()
);

-- Create safety videos table
create table if not exists public.safety_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  thumbnail_url text,
  duration integer,
  category text,
  language text default 'en',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.emergency_contacts enable row level security;
alter table public.wellness_checkins enable row level security;
alter table public.safety_videos enable row level security;

-- RLS Policies for emergency_contacts
create policy "contacts_select_own"
  on public.emergency_contacts for select
  using (auth.uid() = user_id);

create policy "contacts_insert_own"
  on public.emergency_contacts for insert
  with check (auth.uid() = user_id);

create policy "contacts_update_own"
  on public.emergency_contacts for update
  using (auth.uid() = user_id);

create policy "contacts_delete_own"
  on public.emergency_contacts for delete
  using (auth.uid() = user_id);

-- RLS Policies for wellness_checkins
create policy "wellness_select_own"
  on public.wellness_checkins for select
  using (auth.uid() = user_id);

create policy "wellness_insert_own"
  on public.wellness_checkins for insert
  with check (auth.uid() = user_id);

-- RLS Policies for safety_videos (everyone can read)
create policy "videos_select_all"
  on public.safety_videos for select
  using (true);
