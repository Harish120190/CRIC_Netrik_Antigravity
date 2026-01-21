
-- Enhancing matches table for scheduling workflow

-- Add match type and ball type
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_type TEXT CHECK (match_type IN ('league', 'knockout', 'friendly', 'tournament'));
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS ball_type TEXT CHECK (ball_type IN ('tennis', 'leather'));

-- Add team references (nullable to allow ad-hoc teams if needed, but primarily for registered teams)
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team1_id UUID REFERENCES public.teams(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team2_id UUID REFERENCES public.teams(id);

-- Add location details
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS ground_id UUID;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS ground_name TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS longitude NUMERIC;

-- Add officials
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS umpire_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS umpire_name TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS scorer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS scorer_name TEXT;

-- Add details
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS winning_prize TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_fee TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS toss_delayed BOOLEAN DEFAULT false;

-- Add scheduled_at if not match_date (match_date is already there from previous migrations, checking duplication)
-- Previous migration 20260108063031 added: match_date TIMESTAMP WITH TIME ZONE DEFAULT now()
-- We might want to ensure match_date is used for the scheduled time.

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_team1_id ON public.matches(team1_id);
CREATE INDEX IF NOT EXISTS idx_matches_team2_id ON public.matches(team2_id);
CREATE INDEX IF NOT EXISTS idx_matches_match_date ON public.matches(match_date);
