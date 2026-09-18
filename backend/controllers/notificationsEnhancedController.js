// Enhanced Notifications Controller with Real-time Features
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const notificationsEnhancedController = {
  // Get user notifications with pagination
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unread_only = false } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (unread_only === 'true') {
        query = query.eq('is_read', false);
      }

      const { data: notifications, error, count } = await query;

      if (error) throw error;

      const totalPages = Math.ceil(count / limit);

      res.json({
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalNotifications: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  // Mark notification as read
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Notification marked as read' });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      res.json({ message: 'All notifications marked as read' });

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },

  // Delete notification
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Notification deleted' });

    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },

  // Get unread count
  getUnreadCount: async (req, res) => {
    try {
      const userId = req.user.id;

      const { data, error, count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      res.json({ unreadCount: count || 0 });

    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  },

  // Subscribe to subject notifications
  subscribeToSubject: async (req, res) => {
    try {
      const { subject } = req.body;
      const userId = req.user.id;

      if (!subject) {
        return res.status(400).json({ error: 'Subject is required' });
      }

      // Store subscription in user preferences or create a subscriptions table
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      let subscriptions = [];
      if (existingPrefs && existingPrefs.subject_subscriptions) {
        subscriptions = existingPrefs.subject_subscriptions;
      }

      if (!subscriptions.includes(subject)) {
        subscriptions.push(subject);
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          subject_subscriptions: subscriptions
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      res.json({ message: `Subscribed to ${subject} notifications` });

    } catch (error) {
      console.error('Error subscribing to subject:', error);
      res.status(500).json({ error: 'Failed to subscribe to subject' });
    }
  },

  // Unsubscribe from subject
  unsubscribeFromSubject: async (req, res) => {
    try {
      const { subject } = req.params;
      const userId = req.user.id;

      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!existingPrefs || !existingPrefs.subject_subscriptions) {
        return res.json({ message: 'No subscriptions found' });
      }

      const subscriptions = existingPrefs.subject_subscriptions.filter(s => s !== subject);

      const { error } = await supabase
        .from('user_preferences')
        .update({ subject_subscriptions: subscriptions })
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: `Unsubscribed from ${subject} notifications` });

    } catch (error) {
      console.error('Error unsubscribing from subject:', error);
      res.status(500).json({ error: 'Failed to unsubscribe from subject' });
    }
  },

  // Get notification preferences
  getNotificationPreferences: async (req, res) => {
    try {
      const userId = req.user.id;

      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      res.json({
        emailNotifications: preferences?.email_notifications ?? true,
        pushNotifications: preferences?.push_notifications ?? true,
        subjectSubscriptions: preferences?.subject_subscriptions || []
      });

    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({ error: 'Failed to get notification preferences' });
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (req, res) => {
    try {
      const userId = req.user.id;
      const { emailNotifications, pushNotifications, subjectSubscriptions } = req.body;

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          subject_subscriptions: subjectSubscriptions || []
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      res.json({ message: 'Notification preferences updated' });

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  }
};

// Enhanced notification creation function
export const createEnhancedNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('email_notifications, push_notifications')
      .eq('user_id', userId)
      .single();

    // Don't send if user has disabled notifications
    if (preferences && !preferences.push_notifications) {
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId,
        related_type: relatedType,
        is_read: false
      }]);

    if (error) {
      console.error('Error creating notification:', error);
    }

  } catch (error) {
    console.error('Error in createEnhancedNotification:', error);
  }
};

// Notify subject subscribers about new notes
export const notifySubjectSubscribers = async (subject, noteTitle, noteId, uploaderId) => {
  try {
    // Get all users subscribed to this subject
    const { data: subscribers, error } = await supabase
      .from('user_preferences')
      .select('user_id')
      .contains('subject_subscriptions', [subject]);

    if (error) {
      console.error('Error fetching subscribers:', error);
      return;
    }

    // Create notifications for all subscribers (except the uploader)
    const notifications = subscribers
      .filter(sub => sub.user_id !== uploaderId)
      .map(sub => ({
        user_id: sub.user_id,
        type: 'new_note',
        title: 'New Note Available',
        message: `A new note \"${noteTitle}\" has been uploaded in ${subject}`,
        related_id: noteId,
        related_type: 'note',
        is_read: false
      }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error creating subject notifications:', insertError);
      }
    }

  } catch (error) {
    console.error('Error in notifySubjectSubscribers:', error);
  }
};