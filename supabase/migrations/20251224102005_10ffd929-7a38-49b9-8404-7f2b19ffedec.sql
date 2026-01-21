-- Create role enum for team members
CREATE TYPE public.team_role AS ENUM ('admin', 'captain', 'player');

-- Create player status enum
CREATE TYPE public.player_status AS ENUM ('invited', 'pending', 'joined');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT UNIQUE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  team_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_players mapping table
CREATE TABLE public.team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mobile_number TEXT NOT NULL,
  player_name TEXT NOT NULL,
  role team_role DEFAULT 'player',
  status player_status DEFAULT 'invited',
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, mobile_number)
);

-- Create OTP logs for audit
CREATE TABLE public.otp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number TEXT NOT NULL,
  otp_type TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create join requests table
CREATE TABLE public.join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view other profiles"
ON public.profiles FOR SELECT
USING (true);

-- Teams policies
CREATE POLICY "Anyone can view teams"
ON public.teams FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams"
ON public.teams FOR UPDATE
USING (auth.uid() = created_by);

-- Team players policies
CREATE POLICY "Team members can view team players"
ON public.team_players FOR SELECT
USING (true);

CREATE POLICY "Team admins can add players"
ON public.team_players FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.team_players tp
    WHERE tp.team_id = team_id
    AND tp.user_id = auth.uid()
    AND tp.role IN ('admin', 'captain')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_id
    AND t.created_by = auth.uid()
  )
);

CREATE POLICY "Team admins can update players"
ON public.team_players FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.team_players tp
    WHERE tp.team_id = team_id
    AND tp.user_id = auth.uid()
    AND tp.role IN ('admin', 'captain')
  )
  OR
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_id
    AND t.created_by = auth.uid()
  )
  OR user_id = auth.uid()
);

-- OTP logs policies (only insertable, no select for security)
CREATE POLICY "System can insert OTP logs"
ON public.otp_logs FOR INSERT
WITH CHECK (true);

-- Join requests policies
CREATE POLICY "Users can view their join requests"
ON public.join_requests FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create join requests"
ON public.join_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Team admins can view join requests"
ON public.join_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teams t
    WHERE t.id = team_id
    AND t.created_by = auth.uid()
  )
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, mobile_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.phone
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique team code
CREATE OR REPLACE FUNCTION public.generate_team_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to auto-generate team code
CREATE OR REPLACE FUNCTION public.set_team_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.team_code IS NULL THEN
    NEW.team_code := public.generate_team_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_team_code_trigger
  BEFORE INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_team_code();

-- Update timestamps trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();