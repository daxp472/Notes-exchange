import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// Check and deactivate inactive users (7 days)
export const deactivateInactiveUsers = asyncHandler(async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find users who haven't had any activity in 7 days
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email, last_activity')
      .lt('last_activity', sevenDaysAgo.toISOString())
      .eq('is_active', true);

    if (fetchError) {
      throw new Error('Failed to fetch inactive users: ' + fetchError.message);
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return res.json({
        message: 'No inactive users found',
        deactivatedCount: 0,
        users: []
      });
    }

    // Deactivate inactive users
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_active: false, deactivated_at: new Date().toISOString() })
      .lt('last_activity', sevenDaysAgo.toISOString())
      .eq('is_active', true);

    if (updateError) {
      throw new Error('Failed to deactivate users: ' + updateError.message);
    }

    res.json({
      message: `Successfully deactivated ${inactiveUsers.length} inactive users`,
      deactivatedCount: inactiveUsers.length,
      users: inactiveUsers.map(u => ({ id: u.id, name: u.name, email: u.email }))
    });
  } catch (error) {
    console.error('Inactivity deactivation error:', error);
    res.status(500).json({ error: 'Failed to process inactivity check' });
  }
});

// Keep user account alive (reset last_activity)
export const keepAccountAlive = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        last_activity: new Date().toISOString(),
        is_active: true,
        deactivated_at: null
      })
      .eq('id', userId)
      .select('id, is_active, last_activity')
      .single();

    if (updateError) {
      throw new Error('Failed to update last activity: ' + updateError.message);
    }

    res.json({
      message: 'Account status refreshed successfully',
      user: {
        id: user.id,
        isActive: user.is_active,
        lastActivity: user.last_activity
      }
    });
  } catch (error) {
    console.error('Error keeping account alive:', error);
    res.status(500).json({ error: 'Failed to update account status' });
  }
});

// Reactivate deactivated account
export const reactivateAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        last_activity: new Date().toISOString(),
        deactivated_at: null
      })
      .eq('id', userId)
      .select('id, is_active, last_activity')
      .single();

    if (updateError) {
      throw new Error('Failed to reactivate account: ' + updateError.message);
    }

    res.json({
      message: 'Account reactivated successfully',
      user: {
        id: user.id,
        isActive: user.is_active,
        lastActivity: user.last_activity
      }
    });
  } catch (error) {
    console.error('Error reactivating account:', error);
    res.status(500).json({ error: 'Failed to reactivate account' });
  }
});

// Get user inactivity status
export const getInactivityStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, is_active, last_activity, deactivated_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('Failed to fetch user status: ' + error.message);
    }

    const lastActivity = new Date(user.last_activity);
    const now = new Date();
    const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

    res.json({
      userId: user.id,
      isActive: user.is_active,
      lastActivity: user.last_activity,
      deactivatedAt: user.deactivated_at,
      daysSinceActivity,
      message: user.is_active 
        ? `Active. ${daysSinceActivity} days since last activity`
        : `Deactivated on ${new Date(user.deactivated_at).toLocaleDateString()}`
    });
  } catch (error) {
    console.error('Error getting inactivity status:', error);
    res.status(500).json({ error: 'Failed to fetch inactivity status' });
  }
});
