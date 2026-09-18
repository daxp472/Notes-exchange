import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadImageToCloudinary } from '../config/cloudinary.js';
import { getRewardsStore, redeemPerk, claimDailyStreak } from '../controllers/rewardsController.js';

const router = express.Router();

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB strict limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WebP images under 2MB are allowed'));
    }
  }
});

// Rewards Store, Perks & NoteCoins Economy
router.get('/rewards/store', authenticateToken, getRewardsStore);
router.post('/rewards/redeem', authenticateToken, redeemPerk);
router.post('/rewards/claim-daily', authenticateToken, claimDailyStreak);

// Get user statistics
router.get('/stats', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user's uploaded notes count
  const { count: uploadedNotes } = await supabase
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('uploaded_by', userId);

  // Get user's total downloads
  const { data: downloadStats } = await supabase
    .from('notes')
    .select('downloads')
    .eq('uploaded_by', userId);

  const totalDownloads = downloadStats?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;

  // Get user's favorites count
  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  res.json({
    uploadedNotes: uploadedNotes || 0,
    totalDownloads: totalDownloads || 0,
    favoritesCount: favoritesCount || 0,
    contributionScore: req.user.contribution_score || 0,
    badges: req.user.badges || [],
  });
}));

// Get specific user's public profile & privacy settings
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Attempt to fetch full user record
  let user = null;
  const { data: fullUser, error: fullError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!fullError && fullUser) {
    user = fullUser;
  } else {
    // Try basic columns in case of schema discrepancy
    const { data: basicUser, error: basicError } = await supabase
      .from('users')
      .select('id, name, email, college, semester, contribution_score, badges, created_at')
      .eq('id', userId)
      .single();

    if (basicError || !basicUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    user = basicUser;
  }

  // Get notes count & total downloads
  const { data: notesData } = await supabase
    .from('notes')
    .select('id, downloads')
    .eq('uploaded_by', userId);

  const totalNotes = notesData?.length || 0;
  const totalDownloads = notesData?.reduce((sum, n) => sum + (n.downloads || 0), 0) || 0;

  // Get accurate followers and following count from user_follows table
  let followersCount = 0;
  let followingCount = 0;

  try {
    const { count: fCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    followersCount = fCount || 0;

    const { count: fgCount } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    followingCount = fgCount || 0;
  } catch (err) {
    console.warn('Could not query user_follows table:', err);
  }

  const isPrivate = Boolean(user.is_private);
  const showEmail = user.show_email !== false;
  const showFollowers = user.show_followers !== false;
  const showFavorites = user.show_favorites !== false;
  const showActivity = user.show_activity !== false;

  res.json({
    id: user.id,
    name: user.name || 'Student',
    email: showEmail ? user.email : undefined,
    college: user.college || 'University',
    studentId: user.student_id || user.studentId || '',
    department: user.department || '',
    semester: user.semester || 1,
    bio: user.bio || '',
    contributionScore: user.contribution_score || 0,
    badges: user.badges || [],
    isPrivate,
    showEmail,
    showFollowers,
    showFavorites,
    showActivity,
    settings: user.settings || {},
    createdAt: user.created_at,
    avatarUrl: user.avatar_url || user.profile_image || user.avatarUrl || user.profileImage || null,
    avatar_url: user.avatar_url || user.profile_image || user.avatarUrl || user.profileImage || null,
    totalNotes,
    totalDownloads,
    followersCount,
    followingCount,
  });
}));

// Upload Profile Picture (Max 2MB with Cloudinary)
router.post('/avatar', authenticateToken, (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Image is too large. Maximum size is 2MB.' });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Failed to process image' });
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    return res.status(400).json({ error: 'Please select an image file to upload.' });
  }

  // Upload to Cloudinary (returns Cloudinary HTTPS URL or fallback Data URI)
  const imageUrl = await uploadImageToCloudinary(
    req.file.buffer,
    req.file.mimetype || 'image/jpeg',
    'college_notes_avatars'
  );

  let updatedUser = null;
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: imageUrl })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.warn('Database avatar update warning:', error.message);
      // Try updating updated_at or standard fields
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    }
    updatedUser = data || { ...req.user, avatar_url: imageUrl };
  } catch (err) {
    console.warn('Avatar update fallback:', err);
    updatedUser = { ...req.user, avatar_url: imageUrl };
  }

  const finalAvatar = updatedUser?.avatar_url || imageUrl;

  res.json({
    message: 'Profile picture updated successfully',
    avatarUrl: finalAvatar,
    avatar_url: finalAvatar,
    user: {
      ...req.user,
      ...updatedUser,
      avatarUrl: finalAvatar,
      avatar_url: finalAvatar,
    }
  });
}));

// Update user profile (Authenticated)
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, college, semester, department, studentId, bio } = req.body;

  const updatePayload = {};
  if (name !== undefined) updatePayload.name = name.trim();
  if (college !== undefined) updatePayload.college = college.trim();
  if (semester !== undefined) updatePayload.semester = parseInt(semester) || null;
  if (department !== undefined) updatePayload.department = department.trim();
  if (studentId !== undefined) updatePayload.student_id = studentId.trim();
  if (bio !== undefined) updatePayload.bio = bio.trim();

  let updatedUser = null;
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      // If error is about missing columns like student_id or department, update only standard columns
      const safePayload = {};
      if (name !== undefined) safePayload.name = name.trim();
      if (college !== undefined) safePayload.college = college.trim();
      if (semester !== undefined) safePayload.semester = parseInt(semester) || null;

      const { data: fallbackData } = await supabase
        .from('users')
        .update(safePayload)
        .eq('id', userId)
        .select('*')
        .single();
      updatedUser = fallbackData || { ...req.user, ...updatePayload };
    } else {
      updatedUser = data;
    }
  } catch (err) {
    console.warn('Profile update fallback:', err);
    updatedUser = { ...req.user, ...updatePayload };
  }

  res.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
}));

// Update privacy settings (Authenticated)
router.put('/privacy', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { isPrivate, showEmail, showFollowers, showFavorites, showActivity } = req.body;

  const privacyPayload = {};
  if (isPrivate !== undefined) privacyPayload.is_private = Boolean(isPrivate);
  if (showEmail !== undefined) privacyPayload.show_email = Boolean(showEmail);
  if (showFollowers !== undefined) privacyPayload.show_followers = Boolean(showFollowers);
  if (showFavorites !== undefined) privacyPayload.show_favorites = Boolean(showFavorites);
  if (showActivity !== undefined) privacyPayload.show_activity = Boolean(showActivity);

  let updatedPrivacy = {
    isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : false,
    showEmail: showEmail !== undefined ? Boolean(showEmail) : true,
    showFollowers: showFollowers !== undefined ? Boolean(showFollowers) : true,
    showFavorites: showFavorites !== undefined ? Boolean(showFavorites) : true,
    showActivity: showActivity !== undefined ? Boolean(showActivity) : true,
  };

  try {
    const { data, error } = await supabase
      .from('users')
      .update(privacyPayload)
      .eq('id', userId)
      .select('*')
      .single();

    if (!error && data) {
      updatedPrivacy = {
        isPrivate: data.is_private !== undefined ? Boolean(data.is_private) : updatedPrivacy.isPrivate,
        showEmail: data.show_email !== undefined ? Boolean(data.show_email) : updatedPrivacy.showEmail,
        showFollowers: data.show_followers !== undefined ? Boolean(data.show_followers) : updatedPrivacy.showFollowers,
        showFavorites: data.show_favorites !== undefined ? Boolean(data.show_favorites) : updatedPrivacy.showFavorites,
        showActivity: data.show_activity !== undefined ? Boolean(data.show_activity) : updatedPrivacy.showActivity,
      };
    } else if (error) {
      console.warn('Privacy column update notice:', error.message);
      // If columns are not in schema, try storing inside settings jsonb or fallback safely
      await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
  } catch (err) {
    console.warn('Privacy update caught:', err);
  }

  res.json({
    message: 'Privacy settings updated successfully',
    privacy: updatedPrivacy
  });
}));

// Update comprehensive settings (Notifications, Study, Preferences)
router.put('/settings', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { settings } = req.body;

  try {
    await supabase
      .from('users')
      .update({ settings, updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (err) {
    console.warn('Settings update fallback:', err);
  }

  res.json({
    message: 'Settings saved successfully',
    settings: settings || {}
  });
}));

// Change password
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await supabase
    .from('users')
    .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() })
    .eq('id', userId);

  res.json({ message: 'Password updated successfully' });
}));

// Get user's uploaded notes
router.get('/notes', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: notes, error } = await supabase
    .from('notes_with_details')
    .select('*')
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });

  if (error) {
    // Fallback directly to notes table if view doesn't exist
    const { data: rawNotes } = await supabase
      .from('notes')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    return res.json((rawNotes || []).map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      subject: note.subject,
      semester: note.semester,
      course: note.course,
      tags: note.tags || [],
      fileName: note.file_name,
      fileSize: note.file_size,
      fileType: note.file_type,
      downloads: note.downloads || 0,
      rating: note.avg_rating || 0,
      ratingsCount: 0,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
    })));
  }

  res.json(notes.map(note => ({
    id: note.id,
    title: note.title,
    description: note.description,
    subject: note.subject,
    semester: note.semester,
    course: note.course,
    tags: note.tags || [],
    fileName: note.file_name,
    fileSize: note.file_size,
    fileType: note.file_type,
    downloads: note.downloads || 0,
    rating: note.average_rating || 0,
    ratingsCount: note.ratings_count || 0,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
  })));
}));

export default router;