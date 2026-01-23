-- Create Tournaments Table
create table public.tournaments (
  id uuid not null default gen_random_uuid (),
  organizer_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  logo_url text null,
  city text not null,
  start_date date not null,
  end_date date not null,
  ball_type text not null check (ball_type in ('tennis', 'leather')),
  match_format text not null default 'T20',
  overs_per_innings integer not null default 20,
  match_type text not null default 'league', -- league, knockout, hybrid
  status text not null default 'draft', -- draft, active, completed
  created_at timestamp with time zone not null default now(),
  constraint tournaments_pkey primary key (id)
);

-- Create Grounds Table
create table public.grounds (
  id uuid not null default gen_random_uuid (),
  organizer_id uuid not null references auth.users (id),
  name text not null,
  location text not null,
  city text not null,
  hourly_fee numeric null,
  created_at timestamp with time zone not null default now(),
  constraint grounds_pkey primary key (id)
);

-- Create Tournament Teams (Join Table)
create table public.tournament_teams (
  id uuid not null default gen_random_uuid (),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_id uuid not null, -- References your existing Teams table if it exists, else just UUID
  group_name text null, -- 'A', 'B', etc.
  status text not null default 'pending', -- pending, approved, rejected
  joined_at timestamp with time zone not null default now(),
  constraint tournament_teams_pkey primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.tournaments enable row level security;
alter table public.grounds enable row level security;
alter table public.tournament_teams enable row level security;

-- Policies for Tournaments
create policy "Tournaments are viewable by everyone" on public.tournaments
  for select using (true);

create policy "Organizers can insert their own tournaments" on public.tournaments
  for insert with check (auth.uid() = organizer_id);

create policy "Organizers can update their own tournaments" on public.tournaments
  for update using (auth.uid() = organizer_id);

-- Policies for Grounds
create policy "Grounds are viewable by everyone" on public.grounds
  for select using (true);

create policy "Organizers can manage their grounds" on public.grounds
  for all using (auth.uid() = organizer_id);
