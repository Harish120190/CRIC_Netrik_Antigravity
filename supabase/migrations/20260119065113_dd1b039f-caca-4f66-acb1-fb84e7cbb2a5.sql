-- Create tournament registration requests table
CREATE TABLE public.tournament_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT,
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

-- Enable RLS
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone can view registrations
CREATE POLICY "Anyone can view tournament registrations"
  ON public.tournament_registrations
  FOR SELECT
  USING (true);

-- Team owners can create registration requests
CREATE POLICY "Team owners can create registrations"
  ON public.tournament_registrations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = tournament_registrations.team_id
      AND t.created_by = auth.uid()
    )
  );

-- Organizers can update registrations (approve/reject)
CREATE POLICY "Organizers can update registrations"
  ON public.tournament_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.id = tournament_registrations.tournament_id
      AND t.organizer_id = auth.uid()
    )
  );

-- Team owners can delete their pending registrations
CREATE POLICY "Team owners can delete pending registrations"
  ON public.tournament_registrations
  FOR DELETE
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM teams t
      WHERE t.id = tournament_registrations.team_id
      AND t.created_by = auth.uid()
    )
  );