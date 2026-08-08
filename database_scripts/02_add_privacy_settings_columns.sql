-- ============================================================================
-- 02: Add Privacy, Settings, and Profile Columns to Users Table
-- Run this in Supabase SQL Editor if columns are not yet present.
-- ============================================================================

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS student_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS department VARCHAR(150),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_followers BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_favorites BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
    "emailNotifications": {
      "newFollowers": true,
      "noteReviews": true,
      "examReminders": true,
      "weeklyDigest": false,
      "groupMentions": true
    },
    "studyPreferences": {
      "defaultViewer": "in_app",
      "autoBookmarkDownloads": true,
      "offlineCache": true,
      "semesterAutoAdvance": true
    }
  }'::jsonb;
