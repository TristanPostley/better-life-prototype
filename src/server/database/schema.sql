-- Supabase Database Schema for Better Life App
-- Run these SQL commands in the Supabase SQL Editor
-- Instructions: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information and timer settings
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamp with time zone DEFAULT now(),
  timer_duration integer DEFAULT 600, -- Default 10 minutes (600 seconds)
  last_session_date date,
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- Stores completed focus sessions
CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamp with time zone DEFAULT now(),
  duration_seconds integer NOT NULL,
  journal_entry text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_completed_at_idx ON sessions(completed_at DESC);

-- ============================================================================
-- RESPONSES TABLE
-- ============================================================================
-- Stores answers to reflection questions
CREATE TABLE IF NOT EXISTS responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_type text NOT NULL, -- 'better_today', 'life_meaning', etc.
  response_text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for responses
CREATE POLICY "Users can view own responses" ON responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own responses" ON responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS responses_user_id_idx ON responses(user_id);
CREATE INDEX IF NOT EXISTS responses_created_at_idx ON responses(created_at DESC);

-- ============================================================================
-- TRIGGER: AUTO-CREATE PROFILE ON USER SIGN-UP
-- ============================================================================
-- This function automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (for re-running this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify your tables were created correctly

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sessions', 'responses');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'sessions', 'responses');

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================
-- Stores user feedback
CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback
CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (true); -- Allow anyone to insert (authenticated or anon if we allow it, but for now we'll link user_id if present)

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS feedback_user_id_idx ON feedback(user_id);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);
