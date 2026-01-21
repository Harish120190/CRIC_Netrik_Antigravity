-- Remove the overly permissive policy that exposes mobile numbers to all authenticated users
-- The existing "Users can view their own profile" policy already covers owner access
DROP POLICY IF EXISTS "Authenticated users can view basic profiles" ON public.profiles;