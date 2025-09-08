-- ============================================================================
-- COLLEGE NOTES EXCHANGE PLATFORM — STARTER SEED DATA
-- Run this AFTER running 01_full_schema.sql
-- ============================================================================

-- 1. Insert Initial Universities & Colleges
INSERT INTO public.universities (id, name, short_code, domain, city, state, country)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Massachusetts Institute of Technology', 'MIT', 'mit.edu', 'Cambridge', 'MA', 'USA'),
    ('a0000000-0000-0000-0000-000000000002', 'Stanford University', 'Stanford', 'stanford.edu', 'Stanford', 'CA', 'USA'),
    ('a0000000-0000-0000-0000-000000000003', 'University of Delhi', 'DU', 'du.ac.in', 'New Delhi', 'Delhi', 'India'),
    ('a0000000-0000-0000-0000-000000000004', 'Indian Institute of Technology Bombay', 'IITB', 'iitb.ac.in', 'Mumbai', 'Maharashtra', 'India'),
    ('a0000000-0000-0000-0000-000000000005', 'University of California, Berkeley', 'UC Berkeley', 'berkeley.edu', 'Berkeley', 'CA', 'USA'),
    ('a0000000-0000-0000-0000-000000000006', 'University of Oxford', 'Oxford', 'ox.ac.uk', 'Oxford', 'Oxfordshire', 'UK')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Popular Academic Departments
INSERT INTO public.departments (university_id, name, code)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE'),
    ('a0000000-0000-0000-0000-000000000001', 'Electrical Engineering', 'EE'),
    ('a0000000-0000-0000-0000-000000000001', 'Mechanical Engineering', 'ME'),
    ('a0000000-0000-0000-0000-000000000003', 'Department of Computer Science', 'CS-DU'),
    ('a0000000-0000-0000-0000-000000000003', 'Faculty of Management Studies', 'FMS')
ON CONFLICT DO NOTHING;

-- 3. Insert Common Engineering & Science Subjects
INSERT INTO public.courses (name, code, semester)
VALUES
    ('Data Structures & Algorithms', 'CS201', 3),
    ('Operating Systems', 'CS301', 4),
    ('Database Management Systems', 'CS302', 4),
    ('Computer Networks', 'CS401', 5),
    ('Artificial Intelligence & Machine Learning', 'CS501', 6),
    ('Software Engineering', 'CS402', 5),
    ('Digital Logic Design', 'EE201', 3),
    ('Engineering Mathematics I', 'MATH101', 1),
    ('Engineering Mathematics II', 'MATH102', 2),
    ('Object Oriented Programming (Java/C++)', 'CS102', 2),
    ('Web Technologies (Full Stack)', 'CS403', 5),
    ('Cyber Security & Cryptography', 'CS601', 7)
ON CONFLICT DO NOTHING;
