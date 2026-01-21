
-- Create balls table for persistent scoring
CREATE TABLE IF NOT EXISTS public.balls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    innings_no INTEGER NOT NULL, -- 1 or 2
    over_number INTEGER NOT NULL, -- 0-based or 1-based, consistent with frontend (frontend uses 0-based for arrays, but typically stored 1-based or 0-based consistently. Let's stick to 1-based for "Over 1", "Over 2")
    ball_number INTEGER NOT NULL, -- 1-6 usually
    
    -- Player References (using TEXT names for now as Fallback if IDs missing, but UUIDs preferred)
    bowler_id UUID REFERENCES public.profiles(id),
    batsman_id UUID REFERENCES public.profiles(id),
    non_striker_id UUID REFERENCES public.profiles(id),
    
    -- For Ad-hoc/Unregistered players (if IDs are null)
    bowler_name TEXT,
    batsman_name TEXT,
    non_striker_name TEXT,
    
    runs_scored INTEGER DEFAULT 0,
    extras_type TEXT CHECK (extras_type IN ('wide', 'no_ball', 'bye', 'leg_bye', 'penalty')),
    extras_runs INTEGER DEFAULT 0,
    
    is_wicket BOOLEAN DEFAULT false,
    wicket_type TEXT CHECK (wicket_type IN ('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'retired', 'timed_out', 'obstructing', 'handled_ball')),
    player_out_id UUID REFERENCES public.profiles(id),
    player_out_name TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_balls_match_id ON public.balls(match_id);
CREATE INDEX IF NOT EXISTS idx_balls_match_innings ON public.balls(match_id, innings_no);

-- RLS Policies
ALTER TABLE public.balls ENABLE ROW LEVEL SECURITY;

-- Everyone can view balls (for live scoring)
CREATE POLICY "Balls are viewable by everyone" 
ON public.balls FOR SELECT 
USING (true);

-- Only authenticated users (scorers) can insert
CREATE POLICY "Authenticated users can score balls" 
ON public.balls FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow updates (e.g. undo/edit)
CREATE POLICY "Authenticated users can edit balls" 
ON public.balls FOR UPDATE
TO authenticated 
USING (true);

-- Allow delete (undo)
CREATE POLICY "Authenticated users can delete balls" 
ON public.balls FOR DELETE
TO authenticated 
USING (true);
