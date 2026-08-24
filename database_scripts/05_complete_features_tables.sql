-- ============================================================================
-- FULL EXTENDED FEATURES MIGRATION
-- Run this in Supabase SQL Editor to enable:
-- 1. Exam Scheduling & Study Planner
-- 2. Study Groups & Collaboration
-- 3. Group Chat & Private Messages
-- 4. Recently Viewed Notes & Search History
-- ============================================================================

-- 1. EXAM SCHEDULE TABLE
CREATE TABLE IF NOT EXISTS public.exam_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time VARCHAR(50),
    duration VARCHAR(50),
    syllabus TEXT,
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDY GROUPS & CHAT GROUPS TABLES
CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(200),
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_admin BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STUDY GROUP NOTES TABLE
CREATE TABLE IF NOT EXISTS public.study_group_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRIVATE MESSAGES & GROUP MESSAGES TABLES
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    file_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    file_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RECENTLY VIEWED & SEARCH HISTORY TABLES
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_note_view UNIQUE (user_id, note_id)
);

CREATE TABLE IF NOT EXISTS public.search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    filters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECENTLY VIEWED WITH DETAILS VIEW
DROP VIEW IF EXISTS public.recently_viewed_with_details CASCADE;

CREATE OR REPLACE VIEW public.recently_viewed_with_details AS
SELECT 
    rv.id,
    rv.user_id,
    rv.note_id,
    rv.viewed_at,
    jsonb_build_object(
        'id', n.id,
        'title', n.title,
        'description', n.description,
        'subject', n.subject,
        'semester', n.semester,
        'course', n.course,
        'fileName', n.file_name,
        'fileSize', n.file_size,
        'fileType', n.file_type,
        'downloads', n.downloads,
        'createdAt', n.created_at,
        'uploaderName', COALESCE(u.name, 'Student'),
        'uploaderCollege', COALESCE(u.college, 'University')
    ) AS note
FROM public.recently_viewed rv
JOIN public.notes n ON rv.note_id = n.id
LEFT JOIN public.users u ON n.uploaded_by = u.id;

-- 8. GRANT ALL PERMISSIONS TO AUTHENTICATED & ANON USERS
GRANT ALL ON TABLE public.exam_schedule TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.study_groups TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.chat_groups TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.group_members TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.study_group_notes TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.private_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.group_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.recently_viewed TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.search_history TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.recently_viewed_with_details TO postgres, anon, authenticated, service_role;
