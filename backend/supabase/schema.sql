-- Users table (mirrors Supabase Auth, stores extra profile fields)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  rank text default 'Personnel',
  unit text default 'Community Member',
  phone text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Alerts table
create table if not exists public.alerts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'warning', 'info')),
  status text not null default 'active' check (status in ('active', 'resolved')),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  location text not null,
  date timestamptz not null,
  time text,
  category text default 'general',
  organizer text default 'Administration',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Announcements table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text default 'general',
  author text default 'Admin Office',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger alerts_updated_at before update on public.alerts
  for each row execute function update_updated_at();
create trigger events_updated_at before update on public.events
  for each row execute function update_updated_at();
create trigger announcements_updated_at before update on public.announcements
  for each row execute function update_updated_at();

-- RLS: enable row level security
alter table public.profiles enable row level security;
alter table public.alerts enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;

-- Profiles: users can read all, only own row for write
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Alerts: authenticated users can read, only admins write
create policy "Alerts viewable by authenticated users"
  on public.alerts for select using (auth.role() = 'authenticated');
create policy "Admins can insert alerts"
  on public.alerts for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can update alerts"
  on public.alerts for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can delete alerts"
  on public.alerts for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Events: same pattern
create policy "Events viewable by authenticated users"
  on public.events for select using (auth.role() = 'authenticated');
create policy "Admins can insert events"
  on public.events for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can update events"
  on public.events for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can delete events"
  on public.events for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Announcements: same pattern
create policy "Announcements viewable by authenticated users"
  on public.announcements for select using (auth.role() = 'authenticated');
create policy "Admins can insert announcements"
  on public.announcements for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can update announcements"
  on public.announcements for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );
create policy "Admins can delete announcements"
  on public.announcements for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
