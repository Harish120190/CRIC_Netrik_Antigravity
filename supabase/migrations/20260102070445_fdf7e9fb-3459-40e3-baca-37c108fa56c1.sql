-- Fix: Change the view to use SECURITY INVOKER (the default, more secure)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, created_at
FROM public.profiles;