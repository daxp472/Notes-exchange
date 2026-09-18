# Database Setup & Migration Instructions

This folder contains the complete SQL scripts to initialize your **Supabase / AWS PostgreSQL** database from scratch.

---

## 🚀 Quick Start (Running in Supabase SQL Editor)

1. Open your **Supabase Dashboard**: [https://supabase.com/dashboard/project/yxvfqvjjsyyipdmxawkv](https://supabase.com/dashboard/project/yxvfqvjjsyyipdmxawkv)
2. In the left navigation bar, click on **SQL Editor** (`</>`).
3. Click **"+ New query"**.

### Step 1: Run Full Database Schema
- Open [`01_full_schema.sql`](./01_full_schema.sql) in this directory.
- Copy all the contents and paste them into the Supabase SQL Editor.
- Click **"Run"** (or press `Ctrl + Enter` / `Cmd + Enter`).
- You should see: `Success. No rows returned.`

### Step 2: Run Starter Seed Data (Optional but Recommended)
- Open [`02_seed_sample_data.sql`](./02_seed_sample_data.sql).
- Copy and paste it into a new query in the SQL Editor.
- Click **"Run"**.
- This populates initial sample universities (MIT, Stanford, DU, IIT Bombay, Berkeley, Oxford) and standard university courses (DSA, OS, DBMS, AI/ML, Web Tech, etc.).

---

## 🗄️ Tables Created

| Table Name | Description |
| :--- | :--- |
| `universities` | Master list of universities & institutions |
| `departments` | Academic departments & branches |
| `courses` | Academic subjects & semester mapping |
| `users` | Student & moderator accounts with `student_id` & `university_id` |
| `notes` | Uploaded academic notes, summaries, tags, & file paths |
| `ratings` | 1-5 star ratings & student reviews (unique per user per note) |
| `comments` | Threaded discussions & Q&A under notes |
| `favorites` | Student bookmarks for quick access |
| `user_preferences` | Dark mode, notification settings, language |
| `user_follows` | Student-to-student follower graph |
| `user_activity` | Activity audit trail (uploads, downloads, reviews) |
| `private_messages` | Real-time 1-on-1 private messaging |
| `chat_groups` | Study group chat rooms |
| `group_members` | Group member management & admin roles |
| `group_messages` | Study group messaging & file sharing |
| `study_group_notes`| Notes shared inside study groups |
| `exam_schedule` | Exam dates, priorities, & study reminders |
| `notifications` | In-app alerts for ratings, comments, and messages |
| `reports` | Flagged notes/comments for moderation |
| `audit_logs` | Security & system audit logs |

---

## 🔍 Crucial Views & Performance Features
- **`notes_with_details` (View)**: Aggregates real-time average star rating, rating counts, comments count, uploader name, college, and student ID.
- **Triggers**: Automatic `updated_at` timestamps for all relevant tables.
- **Indexes**: Fast B-Tree & GIN indexes for student ID, email, university, subject, semester, and tags.
