-- Execute this in the Supabase SQL Editor to support Admin Profile customizations stored in the Database

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  email TEXT PRIMARY KEY,
  profile_pic TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_admin_profiles" ON public.admin_profiles FOR ALL USING (true);