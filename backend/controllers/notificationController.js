import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Get all notifications for current user
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly === 'true') {
    query = query.eq('is_read', false);
  }

  const { data: notifications, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) {
    throw new Error('Failed to fetch notifications: ' + error.message);
  }

  const totalPages = Math.ceil(count / limit);

  res.json({
    notifications: notifications || [],
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalNotifications: count,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to mark notification as read: ' + error.message);
  }

  res.json({ message: 'Notification marked as read' });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error('Failed to mark all notifications as read: ' + error.message);
  }

  res.json({ message: 'All notifications marked as read' });
});

// Get unread notification count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    throw new Error('Failed to get unread count: ' + error.message);
  }

  res.json({ unreadCount: count || 0 });
});

// Create notification (internal function)
export const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId
      }]);

    if (error) {
      console.error('Failed to create notification:', error.message);
    }
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to delete notification: ' + error.message);
  }

  res.json({ message: 'Notification deleted successfully' });
});