-- Mosaic Analytics — Onboarding Column
-- Execute in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Existing users: mark onboarding as completed so they skip it
UPDATE profiles SET onboarding_completed = TRUE WHERE display_name IS NOT NULL AND display_name != '';
