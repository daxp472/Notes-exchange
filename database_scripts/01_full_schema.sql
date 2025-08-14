-- ============================================================================
-- COLLEGE NOTES EXCHANGE PLATFORM — FULL PRODUCTION DATABASE SCHEMA
-- Target: Supabase PostgreSQL / AWS RDS PostgreSQL
-- ============================================================================

-- Step 0: Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Drop existing view if modifying
DROP VIEW IF EXISTS public.notes_with_details CASCADE;

-- ============================================================================
-- 1. UNIVERSITIES & ACADEMIC CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    short_code VARCHAR(50),
    domain VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Global',
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50),
    semester INTEGER CHECK (semester BETWEEN 1 AND 12),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS & STUDENT PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    college VARCHAR(255),
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    department VARCHAR(150),
    semester INTEGER CHECK (semester BETWEEN 1 AND 12),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url TEXT,
    bio TEXT,
    contribution_score INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. NOTES REPOSITORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    subject VARCHAR(200) NOT NULL,
    semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
    course VARCHAR(200) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    file_path TEXT NOT NULL,
    file_name VARCHAR(300) NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(100) DEFAULT 'unknown',
    uploaded_by UUID NOT NULL CONSTRAINT notes_uploaded_by_fkey REFERENCES public.users(id) ON DELETE CASCADE,
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. COLLABORATION: RATINGS, COMMENTS, BOOKMARKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_note_rating UNIQUE(note_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_favorite_note UNIQUE(user_id, note_id)
);

-- ============================================================================
-- 5. USER SETTINGS & SOCIAL RELATIONSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    dark_mode BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_follower_following UNIQUE(follower_id, following_id),
    CONSTRAINT prevent_self_follow CHECK (follower_id <> following_id)
);

CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. CHAT & STUDY GROUPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL CONSTRAINT private_messages_sender_id_fkey REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL CONSTRAINT private_messages_receiver_id_fkey REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT prevent_self_private_message CHECK (sender_id <> receiver_id)
);

CREATE TABLE IF NOT EXISTS public.chat_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(200),
    university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_admin BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_group_member UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    file_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_group_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.chat_groups(id) ON DELETE CASCADE,
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_study_group_note UNIQUE(group_id, note_id)
);

-- ============================================================================
-- 7. EXAM PLANNER, NOTIFICATIONS, REPORTS, AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.exam_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes_needed TEXT,
    status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    related_type VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_item_id UUID NOT NULL,
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('note', 'comment', 'user', 'message')),
    reason VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. AUTOMATED TIMESTAMPS TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT unnest(ARRAY['universities', 'users', 'notes', 'ratings', 'comments', 'user_preferences', 'chat_groups', 'exam_schedule', 'reports'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_set_updated_at ON public.%I;', t);
        EXECUTE format('CREATE TRIGGER trigger_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();', t);
    END LOOP;
END;
$$;

-- ============================================================================
-- 9. PERFORMANCE & SEARCH OPTIMIZATION INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON public.users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users(college);
CREATE INDEX IF NOT EXISTS idx_users_university_id ON public.users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

CREATE INDEX IF NOT EXISTS idx_notes_uploaded_by ON public.notes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject);
CREATE INDEX IF NOT EXISTS idx_notes_semester ON public.notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_course ON public.notes(course);
CREATE INDEX IF NOT EXISTS idx_notes_university_id ON public.notes(university_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_ratings_note_id ON public.ratings(note_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_note_id ON public.comments(note_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_note_id ON public.favorites(note_id);

CREATE INDEX IF NOT EXISTS idx_private_msgs_sender_receiver ON public.private_messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_private_msgs_created_at ON public.private_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON public.group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON public.group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- ============================================================================
-- 10. CRUCIAL AGGREGATION VIEW (notes_with_details)
-- ============================================================================

CREATE OR REPLACE VIEW public.notes_with_details AS
SELECT 
    n.id,
    n.title,
    n.description,
    n.subject,
    n.semester,
    n.course,
    n.category,
    n.summary,
    n.tags,
    n.file_path,
    n.file_name,
    n.file_size,
    n.file_type,
    n.uploaded_by,
    n.university_id,
    n.downloads,
    n.views,
    n.is_verified,
    n.created_at,
    n.updated_at,
    u.name AS uploader_name,
    u.college AS uploader_college,
    u.student_id AS uploader_student_id,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating,
    COUNT(DISTINCT r.id)::int AS ratings_count,
    COUNT(DISTINCT c.id)::int AS comments_count
FROM public.notes n
LEFT JOIN public.users u ON n.uploaded_by = u.id
LEFT JOIN public.ratings r ON n.id = r.note_id
LEFT JOIN public.comments c ON n.id = c.note_id
GROUP BY n.id, u.name, u.college, u.student_id;
