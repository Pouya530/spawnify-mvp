-- Spawnify MVP - Complete Database Schema
-- Run this file in Supabase SQL Editor
-- Make sure uuid-ossp extension is enabled

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. user_profiles Table
-- Purpose: Store user profile information and gamification data
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  verification_level TEXT DEFAULT 'bronze' CHECK (verification_level IN ('bronze', 'silver', 'gold')),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. grow_logs Table
-- Purpose: Store all mushroom cultivation tracking data
CREATE TABLE grow_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields (required)
  growth_stage TEXT NOT NULL CHECK (growth_stage IN ('Inoculation', 'Colonization', 'Fruiting', 'Harvest')),
  log_date DATE NOT NULL,
  
  -- Environmental data (optional)
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  ph_level DECIMAL(3,1) CHECK (ph_level >= 0 AND ph_level <= 14),
  weight DECIMAL(8,2),
  light_hours_daily DECIMAL(3,1) CHECK (light_hours_daily >= 0 AND light_hours_daily <= 12),
  
  -- Scientific data (required)
  strain VARCHAR(100) NOT NULL,
  substrate VARCHAR(100) NOT NULL,
  substrate_ratio VARCHAR(200),
  inoculation_method VARCHAR(100) NOT NULL,
  inoculation_details VARCHAR(300),
  growing_method VARCHAR(50) NOT NULL,
  tek_method VARCHAR(100),
  tek_notes TEXT,
  
  -- Media & notes
  photos TEXT[],
  notes TEXT,
  
  -- Gamification
  data_completeness_score INTEGER DEFAULT 0 CHECK (data_completeness_score >= 0 AND data_completeness_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. admin_users Table
-- Purpose: Store admin user roles
CREATE TABLE admin_users (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- user_profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Helper function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- grow_logs Policies
CREATE POLICY "Users can view own logs"
  ON grow_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON grow_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON grow_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON grow_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs"
  ON grow_logs FOR SELECT
  USING (is_admin(auth.uid()));

-- admin_users Policies
-- Allow authenticated users to view admin_users (just role info, not sensitive)
-- This prevents infinite recursion that would occur if we checked admin_users within its own policy
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Grow logs indexes
CREATE INDEX idx_grow_logs_user_id ON grow_logs(user_id);
CREATE INDEX idx_grow_logs_created_at ON grow_logs(created_at DESC);
CREATE INDEX idx_grow_logs_log_date ON grow_logs(log_date DESC);
CREATE INDEX idx_grow_logs_growth_stage ON grow_logs(growth_stage);

-- Analytics index (for admin queries)
CREATE INDEX idx_grow_analytics ON grow_logs(strain, substrate, growing_method, growth_stage);

-- User profiles indexes
CREATE INDEX idx_user_profiles_verification_level ON user_profiles(verification_level);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- 1. add_user_points Function
-- Purpose: Add points to user and auto-update verification level
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET 
    total_points = total_points + p_points,
    verification_level = CASE
      WHEN total_points + p_points >= 500 THEN 'gold'
      WHEN total_points + p_points >= 100 THEN 'silver'
      ELSE 'bronze'
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. calculate_completeness_score Function
-- Purpose: Calculate data completeness score for a grow log
CREATE OR REPLACE FUNCTION calculate_completeness_score(
  p_log_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_log RECORD;
BEGIN
  SELECT * INTO v_log FROM grow_logs WHERE id = p_log_id;
  
  -- Required fields complete: 60 points (auto if record exists)
  v_score := 60;
  
  -- Optional fields (10 points each)
  IF v_log.substrate_ratio IS NOT NULL AND v_log.substrate_ratio != '' THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.inoculation_details IS NOT NULL AND v_log.inoculation_details != '' THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.light_hours_daily IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.tek_method IS NOT NULL AND v_log.tek_method != '' THEN
    v_score := v_score + 10;
  END IF;
  
  -- Bonus - TEK notes >100 chars: +15 points
  IF v_log.tek_notes IS NOT NULL AND LENGTH(v_log.tek_notes) > 100 THEN
    v_score := v_score + 15;
  END IF;
  
  -- Bonus - General notes >50 chars: +5 points
  IF v_log.notes IS NOT NULL AND LENGTH(v_log.notes) > 50 THEN
    v_score := v_score + 5;
  END IF;
  
  -- Bonus - Photos uploaded: +10 points
  IF v_log.photos IS NOT NULL AND array_length(v_log.photos, 1) > 0 THEN
    v_score := v_score + 10;
  END IF;
  
  -- Cap at 100
  IF v_score > 100 THEN
    v_score := 100;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. handle_new_user Trigger Function
-- Purpose: Auto-create user_profile when new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, verification_level, total_points)
  VALUES (NEW.id, NEW.email, 'bronze', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. handle_updated_at Trigger Function
-- Purpose: Auto-update updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Auto-create user_profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: Auto-update updated_at on user_profiles
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger: Auto-update updated_at on grow_logs
CREATE TRIGGER set_updated_at_grow_logs
  BEFORE UPDATE ON grow_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Note: Storage bucket creation is typically done via Supabase Dashboard
-- Run this SQL if you prefer SQL method:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('grow-photos', 'grow-photos', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage Policies for grow-photos bucket
-- Note: These policies assume the bucket 'grow-photos' already exists

-- Users can upload to their own folder
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'grow-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view all photos (public bucket)
CREATE POLICY "Public can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'grow-photos');

-- Users can delete own photos
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'grow-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- ============================================================================

-- Uncomment to verify schema after running:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM user_profiles LIMIT 1;
-- SELECT * FROM grow_logs LIMIT 1;
-- SELECT * FROM admin_users LIMIT 1;

