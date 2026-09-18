-- ============================================
-- Supabase Setup — Core Tables for Notes Exchange
-- Run this file in Supabase SQL Editor (SQL -> New query) for the project
-- ============================================

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  password_hash text NOT NULL,
  college text,
  semester integer,
  contribution_score integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  role text DEFAULT 'user',
  is_active boolean DEFAULT true,
  last_activity timestamptz DEFAULT now(),
  deactivated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users ((lower(email)));
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON public.users(last_activity);

-- 2. Notes table (basic schema)
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  subject text,
  semester integer,
  course text,
  tags text[] DEFAULT '{}',
  file_url text,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.users(id) ON DELETE CASCADE,
  downloads integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DROP TRIGGER IF EXISTS set_updated_at_notes ON public.notes;
CREATE TRIGGER set_updated_at_notes BEFORE UPDATE ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON public.notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at);

-- 3. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text,
  title text,
  message text,
  related_id uuid,
  related_type text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 4. Private messages (minimal)
CREATE TABLE IF NOT EXISTS public.private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_private_msgs_created_at ON public.private_messages(created_at);

-- 5. Group messages (minimal)
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON public.group_messages(created_at);

-- 6. Enable Row Level Security (recommended)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own profile
CREATE POLICY IF NOT EXISTS "Users can select own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id::text);

-- Allow users to update their own record (for limited columns)
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- 7. Verification quick checks
-- Run these to verify the tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users','notes','notifications','private_messages','group_messages');

-- End of script
-- ============================================
