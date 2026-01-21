-- Create tournament_invites table
CREATE TABLE public.tournament_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tournament_id, team_id)
);

-- Enable RLS
ALTER TABLE public.tournament_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can view invites (for team members to see their invites)
CREATE POLICY "Anyone can view tournament invites"
ON public.tournament_invites
FOR SELECT
USING (true);

-- Organizers can create invites for their tournaments
CREATE POLICY "Organizers can create tournament invites"
ON public.tournament_invites
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
  )
);

-- Organizers can update invites OR team creators can respond to invites
CREATE POLICY "Organizers and team owners can update invites"
ON public.tournament_invites
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.teams tm
    WHERE tm.id = team_id AND tm.created_by = auth.uid()
  )
);

-- Organizers can delete invites
CREATE POLICY "Organizers can delete tournament invites"
ON public.tournament_invites
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments t
    WHERE t.id = tournament_id AND t.organizer_id = auth.uid()
  )
);