import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Advanced search for notes and users
export const advancedSearch = asyncHandler(async (req, res) => {
  const { 
    q: keyword = '', 
    type = 'all', // 'notes', 'users', 'all'
    subject,
    semester,
    course,
    university,
    college,
    studentId,
    tags,
    rating,
    dateFrom,
    dateTo,
    userId,
    page = 1,
    limit = 24
  } = req.query;

  const offset = (page - 1) * limit;
  const results = { notes: [], users: [], total: 0 };
  const cleanKeyword = keyword.trim();

  // 1. Search Notes
  if (type === 'notes' || type === 'all') {
    let notes = [];
    try {
      let notesQuery = supabase
        .from('notes')
        .select(`
          id, title, description, subject, semester, course, tags,
          file_name, file_path, file_size, file_type, downloads, avg_rating, created_at, updated_at, uploaded_by,
          users:uploaded_by (
            id, name, college, student_id
          )
        `);

      // Apply keyword search
      if (cleanKeyword) {
        notesQuery = notesQuery.or(`title.ilike.%${cleanKeyword}%,description.ilike.%${cleanKeyword}%,subject.ilike.%${cleanKeyword}%,course.ilike.%${cleanKeyword}%`);
      }

      // Apply filters
      if (subject) notesQuery = notesQuery.ilike('subject', `%${subject}%`);
      if (semester) notesQuery = notesQuery.eq('semester', parseInt(semester));
      if (course) notesQuery = notesQuery.ilike('course', `%${course}%`);
      if (rating) notesQuery = notesQuery.gte('avg_rating', parseFloat(rating));
      if (userId) notesQuery = notesQuery.eq('uploaded_by', userId);

      // Date range filter
      if (dateFrom) notesQuery = notesQuery.gte('created_at', dateFrom);
      if (dateTo) notesQuery = notesQuery.lte('created_at', dateTo);

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        notesQuery = notesQuery.overlaps('tags', tagArray);
      }

      const { data: rawNotes, error: notesError } = await notesQuery
        .order('downloads', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (!notesError && rawNotes) {
        notes = rawNotes.map(note => ({
          id: note.id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          semester: note.semester,
          course: note.course,
          tags: note.tags || [],
          fileName: note.file_name,
          fileUrl: note.file_path,
          fileSize: note.file_size,
          fileType: note.file_type,
          uploadedBy: note.uploaded_by,
          uploaderName: note.users?.name || 'Student',
          uploaderCollege: note.users?.college || 'University',
          uploaderStudentId: note.users?.student_id || '',
          downloads: note.downloads || 0,
          rating: note.avg_rating || 0,
          ratingsCount: 0,
          createdAt: note.created_at,
          updatedAt: note.updated_at,
        }));
      }
    } catch (err) {
      console.warn('Notes search fallback:', err);
    }
    results.notes = notes;
  }

  // 2. Search Users / Students with STRICT Privacy Guarding
  if (type === 'users' || type === 'all') {
    let users = [];
    try {
      let usersQuery = supabase
        .from('users')
        .select('id, name, email, college, student_id, department, semester, contribution_score, badges, is_private, show_email, created_at');

      if (cleanKeyword) {
        usersQuery = usersQuery.or(`name.ilike.%${cleanKeyword}%,college.ilike.%${cleanKeyword}%,department.ilike.%${cleanKeyword}%`);
      }

      if (university || college) {
        usersQuery = usersQuery.ilike('college', `%${university || college}%`);
      }

      if (studentId) {
        usersQuery = usersQuery.ilike('student_id', `%${studentId}%`);
      }

      const { data: rawUsers, error: usersError } = await usersQuery
        .order('contribution_score', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (!usersError && rawUsers) {
        users = rawUsers.map(u => {
          const isPrivate = Boolean(u.is_private);
          const showEmail = u.show_email !== false && !isPrivate;

          return {
            id: u.id,
            name: u.name || 'Student',
            // PRIVACY GUARD: Never expose email if private or show_email is false
            email: showEmail ? u.email : undefined,
            college: u.college || 'University',
            studentId: isPrivate ? undefined : u.student_id,
            department: u.department || '',
            semester: u.semester || 1,
            contributionScore: u.contribution_score || 0,
            badges: u.badges || [],
            isPrivate,
            createdAt: u.created_at,
          };
        });
      }
    } catch (err) {
      console.warn('Users search fallback:', err);
    }
    results.users = users;
  }

  results.total = results.notes.length + results.users.length;

  res.json({
    results,
    pagination: {
      currentPage: parseInt(page),
      hasNext: results.total === parseInt(limit),
      hasPrev: page > 1,
    }
  });
});

// Get popular/trending content (Day, Week, Month, All-Time)
export const getTrending = asyncHandler(async (req, res) => {
  const { type = 'notes', period = 'week', limit = 12 } = req.query;

  if (type === 'notes') {
    let dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (period === 'day') {
      dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    } else if (period === 'month') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (period === 'all') {
      dateFilter = new Date(0).toISOString();
    }

    let trendingNotes = [];
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select(`
          id, title, description, subject, semester, course, tags,
          file_name, file_path, file_size, file_type, downloads, avg_rating, created_at, uploaded_by,
          users:uploaded_by (
            id, name, college
          )
        `)
        .gte('created_at', dateFilter)
        .order('downloads', { ascending: false })
        .limit(parseInt(limit));

      if (!error && notes && notes.length > 0) {
        trendingNotes = notes.map(note => ({
          id: note.id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          semester: note.semester,
          course: note.course,
          tags: note.tags || [],
          fileName: note.file_name,
          fileUrl: note.file_path,
          fileSize: note.file_size,
          fileType: note.file_type,
          uploadedBy: note.uploaded_by,
          uploaderName: note.users?.name || 'Student',
          uploaderCollege: note.users?.college || 'University',
          downloads: note.downloads || 0,
          rating: note.avg_rating || 0,
          ratingsCount: 0,
          createdAt: note.created_at,
        }));
      } else {
        // Fallback to top notes all-time if filtered window has few items
        const { data: allNotes } = await supabase
          .from('notes')
          .select(`
            id, title, description, subject, semester, course, tags,
            file_name, file_path, file_size, file_type, downloads, avg_rating, created_at, uploaded_by,
            users:uploaded_by (
              id, name, college
            )
          `)
          .order('downloads', { ascending: false })
          .limit(parseInt(limit));

        trendingNotes = (allNotes || []).map(note => ({
          id: note.id,
          title: note.title,
          description: note.description,
          subject: note.subject,
          semester: note.semester,
          course: note.course,
          tags: note.tags || [],
          fileName: note.file_name,
          fileUrl: note.file_path,
          fileSize: note.file_size,
          fileType: note.file_type,
          uploadedBy: note.uploaded_by,
          uploaderName: note.users?.name || 'Student',
          uploaderCollege: note.users?.college || 'University',
          downloads: note.downloads || 0,
          rating: note.avg_rating || 0,
          ratingsCount: 0,
          createdAt: note.created_at,
        }));
      }
    } catch (err) {
      console.warn('Trending notes fallback:', err);
    }

    res.json({ trending: trendingNotes });
  } else if (type === 'users') {
    let trendingUsers = [];
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, name, college, student_id, department, semester, contribution_score, badges, is_private')
        .order('contribution_score', { ascending: false })
        .limit(parseInt(limit));

      trendingUsers = (users || []).map(u => ({
        id: u.id,
        name: u.name || 'Student',
        college: u.college || 'University',
        studentId: u.is_private ? undefined : u.student_id,
        department: u.department || '',
        semester: u.semester || 1,
        contributionScore: u.contribution_score || 0,
        badges: u.badges || [],
        isPrivate: Boolean(u.is_private)
      }));
    } catch (err) {
      console.warn('Trending users fallback:', err);
    }

    res.json({ trending: trendingUsers });
  }
});

// Get search suggestions
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q: keyword } = req.query;

  if (!keyword || keyword.length < 2) {
    return res.json({ suggestions: [] });
  }

  const clean = keyword.trim().toLowerCase();
  const suggestions = new Set();

  try {
    const { data: notes } = await supabase
      .from('notes')
      .select('subject, course')
      .or(`subject.ilike.%${clean}%,course.ilike.%${clean}%,title.ilike.%${clean}%`)
      .limit(10);

    (notes || []).forEach(note => {
      if (note.subject && note.subject.toLowerCase().includes(clean)) {
        suggestions.add(note.subject);
      }
      if (note.course && note.course.toLowerCase().includes(clean)) {
        suggestions.add(note.course);
      }
    });
  } catch (err) {
    console.warn('Suggestions fallback:', err);
  }

  res.json({ suggestions: Array.from(suggestions) });
});