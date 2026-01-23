-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Linked to Auth)
create table public.profiles (
  id uuid not null references auth.users (id) on delete cascade,
  name text null,
  email text null,
  avatar_url text null,
  role text default 'fan', -- player, scorer, umpire, organizer
  created_at timestamp with time zone default now(),
  constraint profiles_pkey primary key (id)
);

-- 2. TEAMS
create table public.teams (
  id uuid not null default uuid_generate_v4(),
  name text not null,
  short_name text null,
  logo_url text null,
  city text null,
  captain_id uuid references public.profiles(id),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  constraint teams_pkey primary key (id)
);

-- 3. TOURNAMENTS
create table public.tournaments (
  id uuid not null default uuid_generate_v4(),
  organizer_id uuid references auth.users(id),
  name text not null,
  logo_url text null,
  city text not null,
  start_date date not null,
  end_date date not null,
  ball_type text not null check (ball_type in ('tennis', 'leather')),
  match_format text not null default 'T20',
  overs_per_innings integer not null default 20,
  match_type text not null default 'league',
  status text not null default 'draft', -- draft, active, completed
  created_at timestamp with time zone default now(),
  constraint tournaments_pkey primary key (id)
);

-- 4. GROUNDS
create table public.grounds (
  id uuid not null default uuid_generate_v4(),
  organizer_id uuid references auth.users(id),
  name text not null,
  location text not null,
  city text not null,
  hourly_fee numeric null,
  created_at timestamp with time zone default now(),
  constraint grounds_pkey primary key (id)
);

-- 5. MATCHES
create table public.matches (
  id uuid not null default uuid_generate_v4(),
  tournament_id uuid references public.tournaments(id),
  team1_id uuid references public.teams(id),
  team2_id uuid references public.teams(id),
  ground_id uuid references public.grounds(id),
  match_date date not null,
  match_time time null,
  overs integer default 20,
  status text default 'scheduled', -- scheduled, live, completed, abandoned
  toss_winner_id uuid references public.teams(id),
  toss_decision text null, -- bat, bowl
  winner_id uuid references public.teams(id),
  result_description text null,
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  constraint matches_pkey primary key (id)
);

-- 6. BALLS (Scoring Data)
create table public.balls (
  id uuid not null default uuid_generate_v4(),
  match_id uuid not null references public.matches(id),
  innings_no integer not null,
  over_number integer not null,
  ball_number integer not null,
  bowler_id uuid null, -- Link to player profile if strict, else text mapping for MVP
  batsman_id uuid null,
  runs_scored integer default 0,
  extras_type text null, -- wide, noball, bye, legbye
  extras_runs integer default 0,
  is_wicket boolean default false,
  wicket_type text null,
  player_out_id uuid null,
  created_at timestamp with time zone default now(),
  constraint balls_pkey primary key (id)
);

-- 7. TOURNAMENT TEAMS (Join Table)
create table public.tournament_teams (
  id uuid not null default uuid_generate_v4(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id),
  group_name text null,
  status text default 'pending',
  joined_at timestamp with time zone default now(),
  constraint tournament_teams_pkey primary key (id)
);

-- RLS POLICIES (Simpified for MVP)
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.tournaments enable row level security;
alter table public.grounds enable row level security;
alter table public.matches enable row level security;
alter table public.balls enable row level security;
alter table public.tournament_teams enable row level security;

-- Public Read Access
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Public read teams" on public.teams for select using (true);
create policy "Public read tournaments" on public.tournaments for select using (true);
create policy "Public read grounds" on public.grounds for select using (true);
create policy "Public read matches" on public.matches for select using (true);
create policy "Public read balls" on public.balls for select using (true);

-- Authenticated Insert/Update (Broad permissive for demo, restrict in prod)
create policy "Auth users can insert items" on public.profiles for insert with check (auth.uid() = id);
create policy "Auth users can update own profile" on public.profiles for update using (auth.uid() = id);

-- For other tables, allowing auth users to create for now (refine as needed)
create policy "Auth users manage content" on public.tournaments for all using (auth.uid() = organizer_id);
create policy "Auth users manage grounds" on public.grounds for all using (auth.uid() = organizer_id);
