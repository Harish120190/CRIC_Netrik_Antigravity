-- Player Stats Table (aggregated career stats)
CREATE TABLE public.player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  matches INTEGER NOT NULL DEFAULT 0,
  innings INTEGER NOT NULL DEFAULT 0,
  runs INTEGER NOT NULL DEFAULT 0,
  balls_faced INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  highest_score INTEGER NOT NULL DEFAULT 0,
  not_outs INTEGER NOT NULL DEFAULT 0,
  fifties INTEGER NOT NULL DEFAULT 0,
  hundreds INTEGER NOT NULL DEFAULT 0,
  ducks INTEGER NOT NULL DEFAULT 0,
  overs_bowled NUMERIC(5,1) NOT NULL DEFAULT 0,
  balls_bowled INTEGER NOT NULL DEFAULT 0,
  runs_conceded INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  maidens INTEGER NOT NULL DEFAULT 0,
  best_bowling_wickets INTEGER NOT NULL DEFAULT 0,
  best_bowling_runs INTEGER NOT NULL DEFAULT 0,
  catches INTEGER NOT NULL DEFAULT 0,
  stumpings INTEGER NOT NULL DEFAULT 0,
  run_outs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view player stats" ON public.player_stats FOR SELECT USING (true);
CREATE POLICY "Users can update their own stats" ON public.player_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert player stats" ON public.player_stats FOR INSERT WITH CHECK (true);

-- Tournaments Table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'T20',
  overs INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'upcoming',
  start_date DATE NOT NULL,
  end_date DATE,
  venue TEXT,
  organizer_id UUID REFERENCES public.profiles(id),
  banner_url TEXT,
  rules TEXT,
  max_teams INTEGER DEFAULT 16,
  entry_fee NUMERIC(10,2) DEFAULT 0,
  prize_pool TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tournaments" ON public.tournaments FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their tournaments" ON public.tournaments FOR UPDATE USING (auth.uid() = organizer_id);

-- Tournament Teams (participating teams)
CREATE TABLE public.tournament_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  group_name TEXT,
  seed INTEGER,
  status TEXT NOT NULL DEFAULT 'registered',
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  matches_tied INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  net_run_rate NUMERIC(6,3) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament teams" ON public.tournament_teams FOR SELECT USING (true);
CREATE POLICY "Organizers can manage tournament teams" ON public.tournament_teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
);
CREATE POLICY "Organizers can update tournament teams" ON public.tournament_teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
);

-- Add tournament reference to matches
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES public.tournaments(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_date TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS toss_winner TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS toss_decision TEXT;

-- Follows Table (social)
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT follows_target_check CHECK (
    (following_id IS NOT NULL AND following_team_id IS NULL) OR
    (following_id IS NULL AND following_team_id IS NOT NULL)
  ),
  UNIQUE(follower_id, following_id),
  UNIQUE(follower_id, following_team_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Match Comments
CREATE TABLE public.match_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.match_comments(id) ON DELETE CASCADE,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.match_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON public.match_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.match_comments FOR DELETE USING (auth.uid() = user_id);

-- Comment Likes
CREATE TABLE public.comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES public.match_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Badges Table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  threshold INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- User Badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id, match_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Man of the Match voting
CREATE TABLE public.mom_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, voter_id)
);

ALTER TABLE public.mom_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.mom_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.mom_votes FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Fantasy Points Table
CREATE TABLE public.fantasy_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, match_id)
);

ALTER TABLE public.fantasy_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view fantasy points" ON public.fantasy_points FOR SELECT USING (true);
CREATE POLICY "System can insert fantasy points" ON public.fantasy_points FOR INSERT WITH CHECK (true);

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, threshold) VALUES
  ('First Fifty', 'Score your first half-century', '🏏', 'batting', 50),
  ('Century Maker', 'Score a century', '💯', 'batting', 100),
  ('Six Machine', 'Hit 50 sixes in career', '🚀', 'batting', 50),
  ('Boundary King', 'Hit 100 fours in career', '4️⃣', 'batting', 100),
  ('First Wicket', 'Take your first wicket', '🎯', 'bowling', 1),
  ('Five-fer', 'Take 5 wickets in an innings', '🔥', 'bowling', 5),
  ('Hat-trick Hero', 'Take a hat-trick', '🎩', 'bowling', 3),
  ('Economy King', 'Bowl with economy under 4', '📉', 'bowling', 4),
  ('Safe Hands', 'Take 25 catches', '🧤', 'fielding', 25),
  ('Match Winner', 'Win 10 Man of the Match awards', '🏆', 'achievement', 10),
  ('Team Player', 'Play 50 matches', '⭐', 'milestone', 50),
  ('Veteran', 'Play 100 matches', '👑', 'milestone', 100);

-- Enable realtime for notifications and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_comments;

-- Update timestamps trigger for new tables
CREATE TRIGGER update_player_stats_updated_at BEFORE UPDATE ON public.player_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON public.tournaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_match_comments_updated_at BEFORE UPDATE ON public.match_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();