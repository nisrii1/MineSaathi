-- Create hazard reports table
create table if not exists public.hazard_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  severity text not null,
  location text,
  photo_url text,
  status text default 'pending',
  synced boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.hazard_reports enable row level security;

-- RLS Policies
create policy "hazards_select_own"
  on public.hazard_reports for select
  using (auth.uid() = user_id);

create policy "hazards_insert_own"
  on public.hazard_reports for insert
  with check (auth.uid() = user_id);

create policy "hazards_update_own"
  on public.hazard_reports for update
  using (auth.uid() = user_id);

create policy "hazards_delete_own"
  on public.hazard_reports for delete
  using (auth.uid() = user_id);
