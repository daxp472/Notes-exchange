-- ============================================================================
-- 03: Points Economy, Rewards, and Premium Study Materials
-- Run in Supabase SQL Editor if columns/tables are not yet present.
-- ============================================================================

-- Add points & premium fields to notes
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS points_cost INTEGER DEFAULT 0;

-- Add points_earned to user_activity
ALTER TABLE public.user_activity
  ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- Unlocked notes registry (for premium coin-locked notes)
CREATE TABLE IF NOT EXISTS public.note_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  points_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_note_unlock UNIQUE(user_id, note_id)
);

CREATE INDEX IF NOT EXISTS idx_note_unlocks_user ON public.note_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_note_unlocks_note ON public.note_unlocks(note_id);
