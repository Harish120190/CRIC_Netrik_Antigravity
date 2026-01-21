-- Create matches table for storing match history
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Local Ground',
  total_overs INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'completed')),
  result TEXT,
  winner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create innings table for storing innings data
CREATE TABLE public.innings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  innings_number INTEGER NOT NULL CHECK (innings_number IN (1, 2)),
  batting_team_name TEXT NOT NULL,
  bowling_team_name TEXT NOT NULL,
  runs INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  overs INTEGER NOT NULL DEFAULT 0,
  balls INTEGER NOT NULL DEFAULT 0,
  extras INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, innings_number)
);

-- Create balls table for ball-by-ball tracking
CREATE TABLE public.balls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  innings_id UUID NOT NULL REFERENCES public.innings(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  runs INTEGER NOT NULL DEFAULT 0,
  is_wicket BOOLEAN NOT NULL DEFAULT false,
  extras_type TEXT,
  batsman_name TEXT,
  bowler_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read access for viewing matches)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balls ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view matches)
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Anyone can insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update matches" ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Anyone can view innings" ON public.innings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert innings" ON public.innings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update innings" ON public.innings FOR UPDATE USING (true);

CREATE POLICY "Anyone can view balls" ON public.balls FOR SELECT USING (true);
CREATE POLICY "Anyone can insert balls" ON public.balls FOR INSERT WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_innings_updated_at
  BEFORE UPDATE ON public.innings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live score updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.innings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balls;