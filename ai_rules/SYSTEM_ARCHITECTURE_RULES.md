# System Architecture & Engineering Rules

## 1. Zero-Hardcoding Law
- **NO static or dummy arrays in production pages**: All subject lists, courses, universities, user states, and credentials must be driven by dynamic configuration or API endpoints.
- **Environment Driven**: API endpoints, Cloudinary cloud names, upload presets, and Supabase credentials must always be read from `import.meta.env` (frontend) or `process.env` (backend) with clean fallback handling.

## 2. Multi-Discipline Integrity
- The system must treat **Engineering, Medical & Healthcare, Computer Applications, Management, Sciences, Commerce, Law, and Arts** as first-class academic citizens.
- Every note and user profile must support discipline tags, course code standards, and semester intervals appropriate to that discipline.

## 3. Database & Relational Consistency
- Every write operation must preserve foreign key constraints (`ON DELETE CASCADE` or `ON DELETE SET NULL`).
- Never perform duplicate ratings or bookmarks: Always enforce database-level unique constraints (`UNIQUE(user_id, note_id)`).
- Use dynamic database views (`notes_with_details`) to calculate ratings and counts in real time.

## 4. In-App Multimedia & Reading Experience
- Students must be able to read notes and view materials directly inside the application:
  - **PDF Documents**: Rendered seamlessly in responsive embedded viewports with page navigation and download controls.
  - **High-Resolution Photographs/Scans**: High-fidelity in-modal image viewer with zoom, pan, and full-screen modes.
  - **Educational Video Lectures**: Embedded responsive YouTube/video players supporting lecture walkthroughs and timestamps.

## 5. Automated Semester Upgrading
- Academic semesters follow time-based cycles (typically 6 months per semester).
- The platform calculates progress automatically based on enrollment timestamps while allowing manual advancement.
- Degree completion bars reflect total years and semesters of the enrolled academic program.
