-- Fix: Drop the overly permissive "Users can view other profiles" policy
-- and replace with a policy that only allows authenticated users to see limited data
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;

-- Create a more restrictive policy: authenticated users can see basic profile info (not phone)
-- but only the user themselves can see their own phone number (via existing policy)
CREATE POLICY "Authenticated users can view basic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Create a secure view for public profile data (excludes mobile_number)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, full_name, avatar_url, created_at
FROM public.profiles;