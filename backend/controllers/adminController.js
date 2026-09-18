import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get user preferences
export const getUserPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: preferences, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error('Failed to fetch user preferences: ' + error.message);
  }

  // If no preferences exist, create default ones
  if (!preferences) {
    const { data: newPreferences, error: createError } = await supabase
      .from('user_preferences')
      .insert([{
        user_id: userId,
        dark_mode: false,
        email_notifications: true,
        push_notifications: true
      }])
      .select('*')
      .single();

    if (createError) {
      throw new Error('Failed to create default preferences: ' + createError.message);
    }

    return res.json({ preferences: newPreferences });
  }

  res.json({ preferences });
});

// Update user preferences
export const updateUserPreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { darkMode, emailNotifications, pushNotifications } = req.body;

  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (typeof darkMode === 'boolean') updateData.dark_mode = darkMode;
  if (typeof emailNotifications === 'boolean') updateData.email_notifications = emailNotifications;
  if (typeof pushNotifications === 'boolean') updateData.push_notifications = pushNotifications;

  // Try to update existing preferences
  const { data: updatedPreferences, error: updateError } = await supabase
    .from('user_preferences')
    .update(updateData)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (updateError) {
    // If update fails (no existing record), create new one
    if (updateError.code === 'PGRST116') {
      const { data: newPreferences, error: createError } = await supabase
        .from('user_preferences')
        .insert([{
          user_id: userId,
          dark_mode: darkMode ?? false,
          email_notifications: emailNotifications ?? true,
          push_notifications: pushNotifications ?? true
        }])
        .select('*')
        .single();

      if (createError) {
        throw new Error('Failed to create preferences: ' + createError.message);
      }

      return res.json({
        message: 'Preferences created successfully',
        preferences: newPreferences
      });
    }

    throw new Error('Failed to update preferences: ' + updateError.message);
  }

  res.json({
    message: 'Preferences updated successfully',
    preferences: updatedPreferences
  });
});

// Get app statistics (admin)
export const getAppStats = asyncHandler(async (req, res) => {
  try {
    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total notes
    const { count: totalNotes, error: notesError } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true });

    if (notesError) throw notesError;

    // Get total downloads
    const { data: notesWithDownloads, error: downloadsError } = await supabase
      .from('notes')
      .select('downloads');

    if (downloadsError) throw downloadsError;

    const totalDownloads = notesWithDownloads?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;

    // Get new users this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth, error: newUsersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    if (newUsersError) throw newUsersError;

    // Get new notes this month
    const { count: newNotesThisMonth, error: newNotesError } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString());

    if (newNotesError) throw newNotesError;

    // Get total reports
    const { count: totalReports, error: reportsError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (reportsError) throw reportsError;

    // Get pending reports
    const { count: pendingReports, error: pendingError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingError) throw pendingError;

    // Get most active users
    const { data: activeUsers, error: activeUsersError } = await supabase
      .from('users')
      .select('id, name, college, contribution_score')
      .order('contribution_score', { ascending: false })
      .limit(5);

    if (activeUsersError) throw activeUsersError;

    // Get most popular notes
    const { data: popularNotes, error: popularNotesError } = await supabase
      .from('notes_with_details')
      .select('id, title, downloads, average_rating')
      .order('downloads', { ascending: false })
      .limit(5);

    if (popularNotesError) throw popularNotesError;

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalNotes: totalNotes || 0,
        totalDownloads: totalDownloads,
        newUsersThisMonth: newUsersThisMonth || 0,
        newNotesThisMonth: newNotesThisMonth || 0,
        totalReports: totalReports || 0,
        pendingReports: pendingReports || 0,
        activeUsers: activeUsers || [],
        popularNotes: popularNotes || []
      }
    });
  } catch (error) {
    throw new Error('Failed to get app statistics: ' + error.message);
  }
});