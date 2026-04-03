-- Execute this in the Supabase SQL Editor to support Worker Profile customizations stored in the Database

-- Add the profile_pic column to the existing worker_profiles table
ALTER TABLE IF EXISTS public.worker_profiles 
ADD COLUMN IF NOT EXISTS profile_pic TEXT;
