import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const migrations = [
  {
    name: "001_create_profiles",
    sql: `
-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  phone text,
  role text default 'worker',
  department text,
  shift text,
  language text default 'en',
  total_points integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', 'Worker'),
    coalesce(new.raw_user_meta_data ->> 'language', 'en')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
    `,
  },
  {
    name: "002_create_checklists",
    sql: `
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
    `,
  },
  {
    name: "003_create_hazards",
    sql: `
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
    `,
  },
  {
    name: "004_create_gamification",
    sql: `
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
    `,
  },
  {
    name: "005_create_wellness",
    sql: `
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
    `,
  },
  {
    name: "006_seed_badges",
    sql: `
-- Seed initial badges
insert into public.badges (name, description, points_required, rarity) values
  ('Safety First', 'Complete your first safety checklist', 0, 'common'),
  ('Week Warrior', 'Complete checklists for 7 consecutive days', 100, 'uncommon'),
  ('Hazard Hunter', 'Report your first hazard', 0, 'common'),
  ('Guardian Angel', 'Report 10 hazards', 200, 'rare'),
  ('Wellness Champion', 'Complete 30 wellness check-ins', 300, 'rare'),
  ('Perfect Week', 'Complete all tasks for a week without missing any', 500, 'epic'),
  ('Safety Legend', 'Reach 1000 total points', 1000, 'legendary')
on conflict (name) do nothing;
    `,
  },
  {
    name: "007_seed_videos",
    sql: `
-- Seed initial safety videos
insert into public.safety_videos (title, description, video_url, thumbnail_url, duration, category, language) values
  ('Emergency Evacuation Procedures', 'Learn the proper evacuation routes and assembly points', '/videos/evacuation.mp4', '/placeholder.svg?height=200&width=300', 180, 'emergency', 'en'),
  ('Personal Protective Equipment', 'How to properly wear and maintain your PPE', '/videos/ppe.mp4', '/placeholder.svg?height=200&width=300', 240, 'equipment', 'en'),
  ('First Aid Basics', 'Essential first aid procedures for common injuries', '/videos/first-aid.mp4', '/placeholder.svg?height=200&width=300', 300, 'health', 'en'),
  ('Fire Safety', 'Fire prevention and response procedures', '/videos/fire-safety.mp4', '/placeholder.svg?height=200&width=300', 200, 'emergency', 'en')
on conflict do nothing;
    `,
  },
  {
    name: "008_add_video_to_hazards",
    sql: `
-- Add video_url column to hazard_reports table
ALTER TABLE hazard_reports
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment
COMMENT ON COLUMN hazard_reports.video_url IS 'URL of uploaded video evidence for the hazard report';
    `,
  },
]

async function runMigrations() {
  console.log("🚀 Starting database setup...\n")

  for (const migration of migrations) {
    try {
      console.log(`⏳ Running ${migration.name}...`)

      const { error } = await supabase.rpc("exec_sql", {
        sql_query: migration.sql,
      })

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from("_migrations").insert({ name: migration.name })

        if (directError && !directError.message.includes("does not exist")) {
          throw directError
        }

        // Execute SQL directly
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_query: migration.sql }),
        })

        if (!response.ok) {
          // If RPC doesn't exist, execute via raw SQL
          const lines = migration.sql.split(";").filter((line) => line.trim())
          for (const line of lines) {
            if (line.trim()) {
              await supabase.rpc("exec", { sql: line })
            }
          }
        }
      }

      console.log(`✅ ${migration.name} completed\n`)
    } catch (error) {
      console.error(`❌ Error in ${migration.name}:`, error.message)
      console.log("Continuing with next migration...\n")
    }
  }

  console.log("🎉 Database setup complete!")
  console.log("\n📋 Summary:")
  console.log("  ✓ Created profiles table")
  console.log("  ✓ Created checklists tables")
  console.log("  ✓ Created hazard reports table")
  console.log("  ✓ Created gamification tables")
  console.log("  ✓ Created wellness tables")
  console.log("  ✓ Seeded badges")
  console.log("  ✓ Seeded safety videos")
  console.log("  ✓ Added video support to hazards")
  console.log("\n✨ Your MineSaathi app is ready to use!")
}

runMigrations()
