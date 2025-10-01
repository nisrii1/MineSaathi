-- Create daily checklists table
create table if not exists public.daily_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  context jsonb,
  completed boolean default false,
  created_at timestamp with time zone default now(),
  unique(user_id, date)
);

-- Create checklist items table
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.daily_checklists(id) on delete cascade,
  task text not null,
  description text,
  priority text default 'medium',
  completed boolean default false,
  completed_at timestamp with time zone,
  points integer default 10,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.daily_checklists enable row level security;
alter table public.checklist_items enable row level security;

-- RLS Policies for daily_checklists
create policy "checklists_select_own"
  on public.daily_checklists for select
  using (auth.uid() = user_id);

create policy "checklists_insert_own"
  on public.daily_checklists for insert
  with check (auth.uid() = user_id);

create policy "checklists_update_own"
  on public.daily_checklists for update
  using (auth.uid() = user_id);

create policy "checklists_delete_own"
  on public.daily_checklists for delete
  using (auth.uid() = user_id);

-- RLS Policies for checklist_items
create policy "items_select_own"
  on public.checklist_items for select
  using (
    exists (
      select 1 from public.daily_checklists
      where id = checklist_items.checklist_id
      and user_id = auth.uid()
    )
  );

create policy "items_insert_own"
  on public.checklist_items for insert
  with check (
    exists (
      select 1 from public.daily_checklists
      where id = checklist_items.checklist_id
      and user_id = auth.uid()
    )
  );

create policy "items_update_own"
  on public.checklist_items for update
  using (
    exists (
      select 1 from public.daily_checklists
      where id = checklist_items.checklist_id
      and user_id = auth.uid()
    )
  );

create policy "items_delete_own"
  on public.checklist_items for delete
  using (
    exists (
      select 1 from public.daily_checklists
      where id = checklist_items.checklist_id
      and user_id = auth.uid()
    )
  );
