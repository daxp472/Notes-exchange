-- ============================================
-- StudyHub Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ADD INACTIVITY COLUMNS TO USERS TABLE
-- (If table already exists, this adds missing columns)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON users(last_activity);
CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON private_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at);

-- 3. SET DEFAULT VALUES FOR EXISTING USERS
UPDATE users 
SET is_active = true, 
    last_activity = NOW() 
WHERE is_active IS NULL;

-- 4. CREATE KEEP-ALIVE SECURITY POLICY (Optional but recommended)
-- Allows users to update their own last_activity
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own activity" ON users
FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- 5. VERIFY SETUP
-- Run this to check if everything is configured correctly:
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_active', 'last_activity', 'deactivated_at');

-- If you see 3 rows, you're good to go! ✅

-- ============================================
-- Database Setup Complete!
-- ============================================
