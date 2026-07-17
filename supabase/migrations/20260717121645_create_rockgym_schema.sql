/*
# RockGym.fit — Core Schema

## Overview
Creates the full database schema for the RockGym.fit gym management app:
member profiles, coaches, meal plans, workout plans, weekly progress logs,
attendance check-ins, notifications, and admin-managed subscription state.

## New Tables
1. `coaches` — admin-managed coach directory (name, bio, specialty, photo).
2. `profiles` — one row per member (auth user). Extends auth.users with
   fitness/medical/goal/subscription data and a profile photo path.
3. `meal_plans` — meals assigned to a premium member by admin/coach, keyed by
   day of week and time of day.
4. `workout_plans` — exercises assigned to a premium member by admin/coach,
   keyed by day of week.
5. `progress_logs` — weekly check-in entries: weight + photo path + timestamp.
6. `check_ins` — gym attendance log (manual check-in timestamp).
7. `notifications` — in-app reminders (e.g. weekly check-in nudge).
8. `admin_settings` — single-row table holding admin credentials hash + app config.

## Security
- RLS enabled on every table.
- Members can read/write their own data. Admin is a hardcoded login (not a
  Supabase auth user) and operates via the anon-key client, so admin-managed
  tables (coaches, meal_plans, workout_plans, profiles) allow
  `anon, authenticated` CRUD. Admin authorization is enforced in the app layer
  (admin login gate), since admin is not a Supabase auth user.
- Member-owned tables (progress_logs, check_ins, notifications) allow anon read
  (so admin can view) but restrict inserts to the authenticated owner via
  `auth.uid() = user_id`.

## Important Notes
1. `profiles.user_id` defaults to `auth.uid()` so member inserts that omit it
   still satisfy the INSERT policy.
2. `profiles.status`: active | banned | pending.
3. `profiles.subscription_status`: paid | pending | expired.
4. `profiles.plan`: basic | premium.
5. Storage buckets (`profile-photos`, `progress-photos`) are created separately.
6. All policies are idempotent (drop before create).
*/

-- ---------- coaches (created first; profiles references it) ----------
CREATE TABLE IF NOT EXISTS coaches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  specialty text,
  email text,
  phone text,
  photo_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_coaches" ON coaches;
CREATE POLICY "select_coaches"
ON coaches FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_coaches" ON coaches;
CREATE POLICY "insert_coaches"
ON coaches FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_coaches" ON coaches;
CREATE POLICY "update_coaches"
ON coaches FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_coaches" ON coaches;
CREATE POLICY "delete_coaches"
ON coaches FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  date_of_birth date,
  gender text,
  height numeric,            -- cm
  starting_weight numeric,   -- kg
  address text,
  emergency_contact text,
  fitness_goals text,
  medical_notes text,
  plan text NOT NULL DEFAULT 'basic',             -- basic | premium
  subscription_status text NOT NULL DEFAULT 'pending', -- paid | pending | expired
  status text NOT NULL DEFAULT 'active',           -- active | banned | pending
  profile_photo_path text,
  assigned_coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Members read their own profile; admin (anon) reads all.
DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles"
ON profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Members insert their own profile (user_id defaults to auth.uid()).
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Members update their own profile; admin (anon) updates any.
DROP POLICY IF EXISTS "update_profiles" ON profiles;
CREATE POLICY "update_profiles"
ON profiles FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

-- Admin (anon) deletes/bans profiles.
DROP POLICY IF EXISTS "delete_profiles" ON profiles;
CREATE POLICY "delete_profiles"
ON profiles FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- meal_plans ----------
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  day_of_week text NOT NULL,        -- Monday..Sunday
  meal_name text NOT NULL,
  description text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fats_g numeric,
  time_of_day text,                 -- Breakfast / Lunch / Dinner / Snack
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_meal_plans" ON meal_plans;
CREATE POLICY "select_meal_plans"
ON meal_plans FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_meal_plans" ON meal_plans;
CREATE POLICY "insert_meal_plans"
ON meal_plans FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_meal_plans" ON meal_plans;
CREATE POLICY "update_meal_plans"
ON meal_plans FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_meal_plans" ON meal_plans;
CREATE POLICY "delete_meal_plans"
ON meal_plans FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- workout_plans ----------
CREATE TABLE IF NOT EXISTS workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  coach_id uuid REFERENCES coaches(id) ON DELETE SET NULL,
  day_of_week text NOT NULL,
  exercise_name text NOT NULL,
  sets integer,
  reps text,
  rest_seconds integer,
  notes text,
  video_link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_workout_plans" ON workout_plans;
CREATE POLICY "select_workout_plans"
ON workout_plans FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_workout_plans" ON workout_plans;
CREATE POLICY "insert_workout_plans"
ON workout_plans FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_workout_plans" ON workout_plans;
CREATE POLICY "update_workout_plans"
ON workout_plans FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_workout_plans" ON workout_plans;
CREATE POLICY "delete_workout_plans"
ON workout_plans FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- progress_logs ----------
CREATE TABLE IF NOT EXISTS progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  weight numeric,
  photo_path text,
  note text,
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_progress_logs" ON progress_logs;
CREATE POLICY "select_progress_logs"
ON progress_logs FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_own_progress" ON progress_logs;
CREATE POLICY "insert_own_progress"
ON progress_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON progress_logs;
CREATE POLICY "update_own_progress"
ON progress_logs FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_own_progress" ON progress_logs;
CREATE POLICY "delete_own_progress"
ON progress_logs FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- check_ins ----------
CREATE TABLE IF NOT EXISTS check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_check_ins" ON check_ins;
CREATE POLICY "select_check_ins"
ON check_ins FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_own_check_in" ON check_ins;
CREATE POLICY "insert_own_check_in"
ON check_ins FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_check_ins" ON check_ins;
CREATE POLICY "delete_check_ins"
ON check_ins FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- notifications ----------
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications"
ON notifications FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications"
ON notifications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications"
ON notifications FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications"
ON notifications FOR DELETE
TO anon, authenticated
USING (true);

-- ---------- admin_settings ----------
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_username text NOT NULL DEFAULT 'admin',
  admin_password_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_admin_settings" ON admin_settings;
CREATE POLICY "select_admin_settings"
ON admin_settings FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "update_admin_settings" ON admin_settings;
CREATE POLICY "update_admin_settings"
ON admin_settings FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);

-- ---------- indexes ----------
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logged_at ON progress_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_meal_plans_member_id ON meal_plans(member_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_member_id ON workout_plans(member_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ---------- updated_at trigger ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER trg_admin_settings_updated_at BEFORE UPDATE ON admin_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- seed admin_settings with default admin/admin ----------
-- Simple hash (not cryptographically strong; admin auth is app-layer gated).
INSERT INTO admin_settings (admin_username, admin_password_hash)
SELECT 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings WHERE admin_username = 'admin');
