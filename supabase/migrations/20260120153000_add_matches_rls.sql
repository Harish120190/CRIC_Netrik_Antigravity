
-- Enable RLS on matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all matches (for now)
CREATE POLICY "Matches are viewable by everyone" 
ON public.matches FOR SELECT 
USING (true);

-- Allow authenticated users to insert matches (Organizers/Captains)
CREATE POLICY "Authenticated users can create matches" 
ON public.matches FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow creators to update their own matches (optional but good practice)
-- Assuming auth.uid() matches owner (we might need an owner_id column eventually, but for now open)
-- For MVP, we'll allow update if the user is a participant or creator. 
-- Since we don't store "creator_id" on matches yet, we will allow update for now to unblock.
CREATE POLICY "Authenticated users can update matches" 
ON public.matches FOR UPDATE
TO authenticated
USING (true);
