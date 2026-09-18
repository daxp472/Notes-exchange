import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from './notificationController.js';
import { awardPoints } from './rewardsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all notes with filtering and pagination
export const getNotes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    subject,
    semester,
    course,
    college,
    university,
    studentId,
    tags,
    rating,
    sortBy = 'created_at',
    sortOrder = 'desc',
    search
  } = req.query;

  const offset = (page - 1) * limit;
  let query = supabase
    .from('notes_with_details')
    .select('*', { count: 'exact' });

  // Apply filters
  if (subject) query = query.ilike('subject', `%${subject}%`);
  if (semester) query = query.eq('semester', parseInt(semester));
  if (course) query = query.ilike('course', `%${course}%`);
  if (college || university) query = query.ilike('uploader_college', `%${college || university}%`);
  if (studentId) query = query.ilike('uploader_student_id', `%${studentId}%`);
  if (rating) query = query.gte('average_rating', parseFloat(rating));
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%,course.ilike.%${search}%,uploader_college.ilike.%${search}%`);
  }
  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    query = query.overlaps('tags', tagArray);
  }

  // Apply sorting
  const sortColumn = sortBy === 'rating' ? 'average_rating' : 
                    sortBy === 'downloads' ? 'downloads' : 
                    sortBy === 'title' ? 'title' : 'created_at';
  
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data: notes, error, count } = await query;

  if (error) {
    throw new Error('Failed to fetch notes: ' + error.message);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    notes: (notes || []).map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester,
      course: note.course,
      category: note.category || 'general',
      summary: note.summary || null,
      tags: note.tags || [],
      fileName: note.file_name,
      fileUrl: note.file_path,      // Cloudinary / S3 URL
      fileSize: note.file_size,
      fileType: note.file_type,
      uploadedBy: note.uploaded_by,
      uploaderName: note.uploader_name,
      uploaderCollege: note.uploader_college,
      uploaderStudentId: note.uploader_student_id,
      downloads: note.downloads || 0,
      rating: note.average_rating || 0,
      ratingsCount: note.ratings_count || 0,
      commentsCount: note.comments_count || 0,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalNotes: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});



// Get user's uploaded notes
export const getUserNotes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 12,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = req.query;

  const offset = (page - 1) * limit;

  let query = supabase
    .from('notes_with_details')
    .select('*', { count: 'exact' })
    .eq('uploaded_by', userId);

  // Apply sorting
  const sortColumn = sortBy === 'rating' ? 'average_rating' : 
                    sortBy === 'downloads' ? 'downloads' : 
                    sortBy === 'title' ? 'title' : 'created_at';
  
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + parseInt(limit) - 1);

  const { data: notes, error, count } = await query;

  if (error) {
    throw new Error('Failed to fetch user notes: ' + error.message);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    notes: (notes || []).map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester,
      course: note.course,
      category: note.category || 'general',
      summary: note.summary || null,
      tags: note.tags || [],
      fileName: note.file_name,
      fileUrl: note.file_path,       // Cloudinary / S3 URL
      fileSize: note.file_size,
      fileType: note.file_type,
      uploadedBy: note.uploaded_by,
      uploaderName: note.uploader_name,
      uploaderCollege: note.uploader_college,
      uploaderStudentId: note.uploader_student_id,
      downloads: note.downloads || 0,
      rating: note.average_rating || 0,
      ratingsCount: note.ratings_count || 0,
      commentsCount: note.comments_count || 0,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalNotes: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// Get single note by ID
export const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: note, error } = await supabase
    .from('notes_with_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  res.json({
    id: note.id,
    title: note.title,
    description: note.description,
    subject: note.subject,
    semester: note.semester,
    course: note.course,
    category: note.category || 'general',
    summary: note.summary || null,
    tags: note.tags || [],
    fileName: note.file_name,
    fileUrl: note.file_path,           // Cloudinary / S3 URL
    fileSize: note.file_size,
    fileType: note.file_type,
    uploadedBy: note.uploaded_by,
    uploaderName: note.uploader_name,
    uploaderCollege: note.uploader_college,
    uploaderStudentId: note.uploader_student_id,
    downloads: note.downloads || 0,
    views: note.views || 0,
    rating: note.average_rating || 0,
    ratingsCount: note.ratings_count || 0,
    commentsCount: note.comments_count || 0,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  });
});




// Upload new note with smart features
export const uploadNote = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    subject, 
    semester, 
    course, 
    tags, 
    summary, 
    file_path, 
    file_name,
    file_size,
    file_type
  } = req.body;
  
  const userId = req.user.id;

  // Validate required fields
  if (!title || !description || !subject || !semester || !course || !file_path) {
    return res.status(400).json({ 
      message: 'Missing required fields: title, description, subject, semester, course, and file_path are required' 
    });
  }

  // Process tags - ensure it's an array
  let tagArray = [];
  if (Array.isArray(tags)) {
    tagArray = tags.filter(tag => typeof tag === 'string' && tag.trim());
  } else if (typeof tags === 'string') {
    tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  // Auto-generate summary if not provided
  let finalSummary = summary;
  if (!finalSummary && (title || description)) {
    const content = [title, description].filter(Boolean).join(' ');
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    finalSummary = sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '...' : '');
  }

  // Auto-suggest category if not provided
  let suggestedCategory = 'general';
  if (title || description) {
    const content = [title, description].filter(Boolean).join(' ').toLowerCase();
    if (content.includes('lecture') || content.includes('class')) suggestedCategory = 'lecture';
    else if (content.includes('assignment') || content.includes('homework')) suggestedCategory = 'assignment';
    else if (content.includes('exam') || content.includes('test')) suggestedCategory = 'exam';
    else if (content.includes('lab') || content.includes('experiment')) suggestedCategory = 'lab';
    else if (content.includes('project') || content.includes('research')) suggestedCategory = 'project';
  }

  const noteData = {
    title,
    description,
    subject,
    semester: parseInt(semester),
    course,
    tags: tagArray,
    summary: finalSummary,
    category: suggestedCategory,
    file_path,          // Cloudinary file URL
    file_name: file_name || 'unnamed',
    file_size: file_size || 0,
    file_type: file_type || 'unknown',
    uploaded_by: userId,
  };

  const { data: note, error } = await supabase
    .from('notes')
    .insert([noteData])
    .select(`
      *,
      users!notes_uploaded_by_fkey (
        name,
        college
      )
    `)
    .single();

  if (error) {
    throw new Error('Failed to save note: ' + error.message);
  }

  // Award 25 NoteCoins and record user activity
  await awardPoints(userId, 25, 'upload', `Uploaded "${note.title}"`);

  res.status(201).json({
    message: 'Note uploaded successfully',
    note: {
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester,
      course: note.course,
      tags: note.tags || [],
      summary: note.summary,
      category: note.category,
      fileUrl: note.file_path,
      fileName: note.file_name,
      fileSize: note.file_size,
      fileType: note.file_type,
      uploadedBy: note.uploaded_by,
      uploaderName: note.users.name,
      uploaderCollege: note.users.college,
      downloads: 0,
      rating: 0,
      ratingsCount: 0,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    }
  });
});


// Download note
export const downloadNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const { data: note, error } = await supabase
    .from('notes')
    .select('file_path, uploaded_by, title, downloads, file_name')
    .eq('id', id)
    .single();

  if (error || !note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  // Increment download count
  await supabase
    .from('notes')
    .update({ downloads: (note.downloads || 0) + 1 })
    .eq('id', id);

  // Record user activity if user is logged in
  if (userId) {
    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        note_id: id,
        action_type: 'download'
      }]);

    // Add to recently viewed
    await supabase
      .from('recently_viewed')
      .upsert({
        user_id: userId,
        note_id: id,
        viewed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,note_id'
      });

    // Reward note owner +5 NoteCoins if downloaded by another student
    if (note.uploaded_by && note.uploaded_by !== userId) {
      await awardPoints(note.uploaded_by, 5, 'download', `Peer downloaded "${note.title}"`);
    }
  }

  // Return Cloudinary URL and original filename for frontend to handle
  res.json({ 
    fileUrl: note.file_path, 
    title: note.title,
    fileName: note.file_name
  });
});


// Rate a note
export const rateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  // Check if user already rated this note
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('note_id', id)
    .eq('user_id', userId)
    .single();

  if (existingRating) {
    // Update existing rating
    const { error } = await supabase
      .from('ratings')
      .update({ rating, comment })
      .eq('id', existingRating.id);

    if (error) {
      throw new Error('Failed to update rating: ' + error.message);
    }
  } else {
    // Create new rating
    const { error } = await supabase
      .from('ratings')
      .insert([{
        note_id: id,
        user_id: userId,
        rating,
        comment
      }]);

    if (error) {
      throw new Error('Failed to save rating: ' + error.message);
    }

    // Get note owner and create notification
    const { data: note } = await supabase
      .from('notes')
      .select('uploaded_by, title')
      .eq('id', id)
      .single();

    if (note && note.uploaded_by !== userId) {
      const pointValue = Number(rating) === 5 ? 20 : 10;
      await awardPoints(note.uploaded_by, pointValue, 'rating', `Received ${rating}-star rating on "${note.title}"`);

      await createNotification(
        note.uploaded_by,
        'rating',
        'New Rating Received',
        `Your note "${note.title}" received a ${rating}-star rating (+${pointValue} NoteCoins)`,
        id
      );
    }
  }

  res.json({ message: 'Rating saved successfully' });
});



// Get note ratings
export const getNoteRatings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: ratings, error } = await supabase
    .from('ratings')
    .select(`
      *,
      users!ratings_user_id_fkey (
        name,
        college
      )
    `)
    .eq('note_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch ratings: ' + error.message);
  }

  res.json(ratings.map(rating => ({
    id: rating.id,
    noteId: rating.note_id,
    userId: rating.user_id,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.created_at,
    userName: rating.users.name,
    userCollege: rating.users.college,
  })));
});



// Delete note (only by uploader)
export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { data: note, error: fetchError } = await supabase
    .from('notes')
    .select('uploaded_by, file_path')
    .eq('id', id)
    .single();

  if (fetchError || !note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.uploaded_by !== userId) {
    return res.status(403).json({ message: 'You can only delete your own notes' });
  }

  // Note: We're not deleting from Cloudinary since we want to keep files
  // In a production environment, you might want to implement a more sophisticated
  // cleanup strategy

  // Delete from database
  const { error: deleteError } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new Error('Failed to delete note: ' + deleteError.message);
  }

  res.json({ message: 'Note deleted successfully' });
});



// Add to favorites
export const addFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('favorites')
    .upsert([{ user_id: userId, note_id: id }], {
      onConflict: 'user_id,note_id'
    });

  if (error) {
    throw new Error('Failed to add favorite: ' + error.message);
  }

  // Get note owner and create notification
  const { data: note } = await supabase
    .from('notes')
    .select('uploaded_by, title')
    .eq('id', id)
    .single();

  if (note && note.uploaded_by !== userId) {
    await createNotification(
      note.uploaded_by,
      'favorite',
      'Note Favorited',
      `Your note "${note.title}" was added to someone's favorites`,
      id
    );
  }

  res.json({ message: 'Added to favorites' });
});



// Remove from favorites
export const removeFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('note_id', id);

  if (error) {
    throw new Error('Failed to remove favorite: ' + error.message);
  }

  res.json({ message: 'Removed from favorites' });
});



// Get user favorites
export const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('note_id')
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to fetch favorites: ' + error.message);
  }

  res.json(favorites);
});



// Add comment to note
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  if (comment.length > 500) {
    return res.status(400).json({ message: 'Comment must be less than 500 characters' });
  }

  // Check if note exists
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id')
    .eq('id', id)
    .single();

  if (noteError || !note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  // Create new comment
  const { data: newComment, error } = await supabase
    .from('comments')
    .insert([{
      note_id: id,
      user_id: userId,
      comment_text: comment.trim()
    }])
    .select(`
      *,
      users!comments_user_id_fkey (
        name,
        college
      )
    `)
    .single();

  if (error) {
    throw new Error('Failed to save comment: ' + error.message);
  }

  // Get note owner and create notification
  const { data: noteData } = await supabase
    .from('notes')
    .select('uploaded_by, title')
    .eq('id', id)
    .single();

  if (noteData && noteData.uploaded_by !== userId) {
    await createNotification(
      noteData.uploaded_by,
      'comment',
      'New Comment',
      `Someone commented on your note "${noteData.title}"`,
      id
    );
  }

  // Award +5 NoteCoins for contributing to discussion
  await awardPoints(userId, 5, 'comment', `Commented on "${noteData?.title || 'note'}"`);

  res.status(201).json({
    message: 'Comment added successfully',
    comment: {
      id: newComment.id,
      noteId: newComment.note_id,
      userId: newComment.user_id,
      comment: newComment.comment_text,
      createdAt: newComment.created_at,
      userName: newComment.users.name,
      userCollege: newComment.users.college,
    }
  });
});



// Get note comments
export const getNoteComments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const offset = (page - 1) * limit;

  // Check if note exists
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .select('id')
    .eq('id', id)
    .single();

  if (noteError || !note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  const { data: comments, error, count } = await supabase
    .from('comments')
    .select(`
      *,
      users!comments_user_id_fkey (
        name,
        college
      )
    `, { count: 'exact' })
    .eq('note_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    throw new Error('Failed to fetch comments: ' + error.message);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    comments: comments.map(comment => ({
      id: comment.id,
      noteId: comment.note_id,
      userId: comment.user_id,
      comment: comment.comment_text,
      createdAt: comment.created_at,
      userName: comment.users.name,
      userCollege: comment.users.college,
    })),
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalComments: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// AI Smart Recommendations for Related Notes / Modules (Activity-Driven)
export const getRecommendations = asyncHandler(async (req, res) => {
  const { noteId, subject, course, semester, discipline, userId, limit = 6 } = req.query;

  let preferredSubjects = [];
  if (subject) preferredSubjects.push(subject);

  // If userId is provided, extract subjects from their recent activity to drive personalized suggestions
  if (userId && !subject) {
    try {
      const { data: userActs } = await supabase
        .from('user_activity')
        .select('notes:note_id (subject, course)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(6);

      userActs?.forEach(act => {
        if (act.notes?.subject && !preferredSubjects.includes(act.notes.subject)) {
          preferredSubjects.push(act.notes.subject);
        }
      });
    } catch (err) {
      console.warn('Activity recommendation extraction notice:', err);
    }
  }

  let query = supabase
    .from('notes')
    .select(`
      id, title, description, subject, semester, course, tags,
      file_name, file_path, file_size, file_type, downloads, avg_rating, created_at, uploaded_by,
      users:uploaded_by (
        id, name, college
      )
    `);

  if (noteId) {
    query = query.neq('id', noteId);
  }

  if (preferredSubjects.length > 0) {
    const orFilter = preferredSubjects.map(s => `subject.ilike.%${s}%`).join(',');
    query = query.or(orFilter);
  } else if (discipline) {
    query = query.or(`course.ilike.%${discipline}%,description.ilike.%${discipline}%`);
  }

  if (semester) {
    query = query.eq('semester', parseInt(semester));
  }

  const { data: notes, error } = await query
    .order('downloads', { ascending: false })
    .limit(parseInt(limit));

  let finalNotes = notes || [];

  // Fallback to top rated notes if no specific matches found
  if (finalNotes.length === 0) {
    const { data: fallbackNotes } = await supabase
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

    finalNotes = fallbackNotes || [];
  }

  res.json({
    recommendations: finalNotes.map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester,
      course: note.course,
      tags: note.tags || [],
      fileName: note.file_name,
      fileUrl: note.file_path,
      uploaderName: note.users?.name || 'Student',
      uploaderCollege: note.users?.college || 'University',
      downloads: note.downloads || 0,
      rating: note.avg_rating || 0,
      ratingsCount: 0,
      createdAt: note.created_at,
    }))
  });
});

// Trending Seasons Analytics (Exam Season, Midterms, Fall/Spring Surges)
export const getSeasonalTrends = asyncHandler(async (req, res) => {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Determine current academic season
  let currentSeason = 'Regular Term';
  let seasonRecommendation = 'Explore fundamental lecture notes and standard assignments';
  let peakSubjects = ['Mathematics', 'Computer Science', 'Anatomy', 'Business Economics'];

  if ([4, 5, 11, 12].includes(currentMonth)) {
    currentSeason = 'Finals Exam Surge Season';
    seasonRecommendation = 'High demand for quick revision formula sheets, past question papers, and solved modules';
  } else if ([2, 3, 9, 10].includes(currentMonth)) {
    currentSeason = 'Mid-Term Preparation Season';
    seasonRecommendation = 'Focus on Unit 1-3 lecture notes and lab experiment manuals';
  } else if ([7, 8, 1].includes(currentMonth)) {
    currentSeason = 'Semester Launch & Syllabus Discovery';
    seasonRecommendation = 'Students are searching for foundational textbooks, subject outlines, and prerequisite notes';
  }

  const { data: topNotes } = await supabase
    .from('notes_with_details')
    .select('id, title, subject, course, downloads, average_rating, uploader_college')
    .order('downloads', { ascending: false })
    .limit(8);

  res.json({
    season: {
      name: currentSeason,
      month: currentMonth,
      recommendation: seasonRecommendation,
      hotDisciplines: ['Computer Applications (BCA/BCS)', 'Engineering (B.Tech)', 'Medical (MBBS/B.Pharm)', 'Management (BBA/MBA)'],
      peakSubjects
    },
    topNotes: topNotes || []
  });
});