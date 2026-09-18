// Social Features Controller - Follow/Unfollow, Study Groups, Bookmarks
import { supabase } from '../config/supabase.js';
import { awardPoints } from './rewardsController.js';
import { createEnhancedNotification } from './notificationsEnhancedController.js';

export const socialController = {
  // Follow a user
  followUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;

      if (followerId === followingId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if already following
      const { data: existingFollow, error: checkError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingFollow) {
        return res.json({ message: 'Already following this user', isFollowing: true });
      }

      // Create follow relationship
      const { error } = await supabase
        .from('user_follows')
        .insert([{
          follower_id: followerId,
          following_id: followingId
        }]);

      if (error) throw error;

      // Get follower info for notification
      const { data: follower, error: followerError } = await supabase
        .from('users')
        .select('name')
        .eq('id', followerId)
        .single();

      if (!followerError && follower) {
        // Create notification for the followed user
        await createEnhancedNotification(
          followingId,
          'follow',
          'New Follower',
          `${follower.name} started following you`,
          followerId,
          'user'
        );
      }

      res.json({ message: 'Successfully followed user' });

    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  },

  // Unfollow a user
  unfollowUser: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      if (error) throw error;

      res.json({ message: 'Successfully unfollowed user' });

    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  },

  // Get user's followers
  getFollowers: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: followers, error, count } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          created_at,
          users:follower_id (
            id, name, email, college, contribution_score
          )
        `, { count: 'exact' })
        .eq('following_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;

      const totalPages = Math.ceil(count / limit);

      res.json({
        followers: followers.map(follow => ({
          id: follow.users.id,
          name: follow.users.name,
          email: follow.users.email,
          college: follow.users.college,
          contribution_score: follow.users.contribution_score,
          followedAt: follow.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFollowers: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (error) {
      console.error('Error fetching followers:', error);
      res.status(500).json({ error: 'Failed to fetch followers' });
    }
  },

  // Get users that a user is following
  getFollowing: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: following, error, count } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          created_at,
          users:following_id (
            id, name, email, college, contribution_score
          )
        `, { count: 'exact' })
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;

      const totalPages = Math.ceil(count / limit);

      res.json({
        following: following.map(follow => ({
          id: follow.users.id,
          name: follow.users.name,
          email: follow.users.email,
          college: follow.users.college,
          contribution_score: follow.users.contribution_score,
          followedAt: follow.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalFollowing: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (error) {
      console.error('Error fetching following:', error);
      res.status(500).json({ error: 'Failed to fetch following' });
    }
  },

  // Check follow status between two users
  getFollowStatus: async (req, res) => {
    try {
      const followerId = req.user.id;
      const { userId: followingId } = req.params;

      const { data: followStatus, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      res.json({ isFollowing: !!followStatus });

    } catch (error) {
      console.error('Error checking follow status:', error);
      res.status(500).json({ error: 'Failed to check follow status' });
    }
  },

  // Create study group
  createStudyGroup: async (req, res) => {
    try {
      const { name, description } = req.body;
      const createdBy = req.user.id;

      if (!name) {
        return res.status(400).json({ error: 'Group name is required' });
      }

      const { data: group, error } = await supabase
        .from('study_groups')
        .insert([{
          name,
          description,
          created_by: createdBy
        }])
        .select(`
          *,
          users:created_by (name, college)
        `)
        .single();

      if (error) throw error;

      // Add creator as member
      await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          user_id: createdBy
        }]);

      res.status(201).json({
        message: 'Study group created successfully',
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          createdBy: group.users.name,
          createdAt: group.created_at,
          memberCount: 1
        }
      });

    } catch (error) {
      console.error('Error creating study group:', error);
      res.status(500).json({ error: 'Failed to create study group' });
    }
  },

  // Get study groups
  getStudyGroups: async (req, res) => {
    try {
      const { page = 1, limit = 12, search } = req.query;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('study_groups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: groups, error, count } = await query;

      if (error) {
        return res.json({ groups: [], pagination: { currentPage: 1, totalPages: 0, totalGroups: 0 } });
      }

      res.json({
        groups: (groups || []).map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          createdBy: group.created_by || 'Campus Community',
          createdByCollege: 'University',
          createdAt: group.created_at,
          memberCount: 1
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((count || 0) / limit),
          totalGroups: count || 0,
          hasNext: false,
          hasPrev: false,
        }
      });

    } catch (error) {
      console.warn('Study groups fetch fallback:', error);
      res.json({ groups: [], pagination: { currentPage: 1, totalPages: 0, totalGroups: 0 } });
    }
  },

  // Get single study group with details
  getStudyGroup: async (req, res) => {
    try {
      const { groupId } = req.params;

      const { data: group, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          users:created_by (name, college),
          group_members (
            id,
            joined_at,
            users:user_id (id, name, college, contribution_score)
          ),
          study_group_notes (
            id,
            added_at,
            notes:note_id (id, title, subject, course, file_name)
          )
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;

      if (!group) {
        return res.status(404).json({ error: 'Study group not found' });
      }

      res.json({
        id: group.id,
        name: group.name,
        description: group.description,
        createdBy: group.users.name,
        createdByCollege: group.users.college,
        createdAt: group.created_at,
        members: group.group_members.map(member => ({
          id: member.users.id,
          name: member.users.name,
          college: member.users.college,
          contributionScore: member.users.contribution_score,
          joinedAt: member.joined_at
        })),
        notes: group.study_group_notes.map(note => ({
          id: note.notes.id,
          title: note.notes.title,
          subject: note.notes.subject,
          course: note.notes.course,
          fileName: note.notes.file_name,
          addedAt: note.added_at
        }))
      });

    } catch (error) {
      console.error('Error fetching study group:', error);
      res.status(500).json({ error: 'Failed to fetch study group' });
    }
  },

  // Update study group
  updateStudyGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;
      const userId = req.user.id;

      // Check if user is the creator
      const { data: group, error: checkError } = await supabase
        .from('study_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (checkError) throw checkError;

      if (!group || group.created_by !== userId) {
        return res.status(403).json({ error: 'Only group creator can update the group' });
      }

      const { error } = await supabase
        .from('study_groups')
        .update({ name, description })
        .eq('id', groupId);

      if (error) throw error;

      res.json({ message: 'Study group updated successfully' });

    } catch (error) {
      console.error('Error updating study group:', error);
      res.status(500).json({ error: 'Failed to update study group' });
    }
  },

  // Delete study group
  deleteStudyGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      // Check if user is the creator
      const { data: group, error: checkError } = await supabase
        .from('study_groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (checkError) throw checkError;

      if (!group || group.created_by !== userId) {
        return res.status(403).json({ error: 'Only group creator can delete the group' });
      }

      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      res.json({ message: 'Study group deleted successfully' });

    } catch (error) {
      console.error('Error deleting study group:', error);
      res.status(500).json({ error: 'Failed to delete study group' });
    }
  },

  // Join study group
  joinStudyGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingMember) {
        return res.status(400).json({ error: 'Already a member of this group' });
      }

      const { error } = await supabase
        .from('group_members')
        .insert([{
          group_id: groupId,
          user_id: userId
        }]);

      if (error) throw error;

      // Award +20 NoteCoins welcome bonus
      await awardPoints(userId, 20, 'join_group', 'Joined study group');

      res.json({ message: 'Successfully joined study group (+20 NoteCoins awarded!)' });

    } catch (error) {
      console.error('Error joining study group:', error);
      res.status(500).json({ error: 'Failed to join study group' });
    }
  },

  // Leave study group
  leaveStudyGroup: async (req, res) => {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Successfully left study group' });

    } catch (error) {
      console.error('Error leaving study group:', error);
      res.status(500).json({ error: 'Failed to leave study group' });
    }
  },

  // Add note to study group
  addNoteToGroup: async (req, res) => {
    try {
      const { groupId, noteId } = req.params;
      const userId = req.user.id;

      // Check if user is a member of the group
      const { data: member, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) {
        return res.status(403).json({ error: 'Must be a group member to add notes' });
      }

      // Check if note already exists in group
      const { data: existingNote, error: checkError } = await supabase
        .from('study_group_notes')
        .select('id')
        .eq('group_id', groupId)
        .eq('note_id', noteId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingNote) {
        return res.status(400).json({ error: 'Note already exists in this group' });
      }

      const { error } = await supabase
        .from('study_group_notes')
        .insert([{
          group_id: groupId,
          note_id: noteId
        }]);

      if (error) throw error;

      res.json({ message: 'Note added to study group successfully' });

    } catch (error) {
      console.error('Error adding note to group:', error);
      res.status(500).json({ error: 'Failed to add note to group' });
    }
  },

  // Remove note from study group
  removeNoteFromGroup: async (req, res) => {
    try {
      const { groupId, noteId } = req.params;
      const userId = req.user.id;

      // Check if user is a member of the group
      const { data: member, error: memberError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .single();

      if (memberError || !member) {
        return res.status(403).json({ error: 'Must be a group member to remove notes' });
      }

      const { error } = await supabase
        .from('study_group_notes')
        .delete()
        .eq('group_id', groupId)
        .eq('note_id', noteId);

      if (error) throw error;

      res.json({ message: 'Note removed from study group successfully' });

    } catch (error) {
      console.error('Error removing note from group:', error);
      res.status(500).json({ error: 'Failed to remove note from group' });
    }
  },

  // Bookmark a note
  bookmarkNote: async (req, res) => {
    try {
      const { noteId } = req.params;
      const userId = req.user.id;

      // Check if already bookmarked
      const { data: existingBookmark, error: checkError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('note_id', noteId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingBookmark) {
        return res.status(400).json({ error: 'Note already bookmarked' });
      }

      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: userId,
          note_id: noteId
        }]);

      if (error) throw error;

      res.json({ message: 'Note bookmarked successfully' });

    } catch (error) {
      console.error('Error bookmarking note:', error);
      res.status(500).json({ error: 'Failed to bookmark note' });
    }
  },

  // Remove bookmark
  removeBookmark: async (req, res) => {
    try {
      const { noteId } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('note_id', noteId);

      if (error) throw error;

      res.json({ message: 'Bookmark removed successfully' });

    } catch (error) {
      console.error('Error removing bookmark:', error);
      res.status(500).json({ error: 'Failed to remove bookmark' });
    }
  },

  // Get user's bookmarked notes
  getUserBookmarks: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      const { data: bookmarks, error, count } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          notes:note_id (
            id, title, description, subject, semester, course, tags,
            file_name, file_size, file_type, downloads, created_at,
            users:uploaded_by (name, college)
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;

      const totalPages = Math.ceil(count / limit);

      res.json({
        bookmarks: bookmarks.map(bookmark => ({
          bookmarkId: bookmark.id,
          bookmarkedAt: bookmark.created_at,
          note: {
            id: bookmark.notes.id,
            title: bookmark.notes.title,
            description: bookmark.notes.description,
            subject: bookmark.notes.subject,
            semester: bookmark.notes.semester,
            course: bookmark.notes.course,
            tags: bookmark.notes.tags,
            fileName: bookmark.notes.file_name,
            fileSize: bookmark.notes.file_size,
            fileType: bookmark.notes.file_type,
            downloads: bookmark.notes.downloads,
            createdAt: bookmark.notes.created_at,
            uploaderName: bookmark.notes.users.name,
            uploaderCollege: bookmark.notes.users.college
          }
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookmarks: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  },

  // Get profile social stats
  getProfileStats: async (req, res) => {
    try {
      const { userId } = req.params;

      // Get followers count
      const { data: followersData, error: followersError, count: followersCount } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (followersError) throw followersError;

      // Get following count
      const { data: followingData, error: followingError, count: followingCount } = await supabase
        .from('user_follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      // Get notes count
      const { data: notesData, error: notesError, count: notesCount } = await supabase
        .from('notes')
        .select('id', { count: 'exact', head: true })
        .eq('uploaded_by', userId);

      if (notesError) throw notesError;

      // Get total downloads
      const { data: downloadData, error: downloadError } = await supabase
        .from('notes')
        .select('downloads')
        .eq('uploaded_by', userId);

      if (downloadError) throw downloadError;

      const totalDownloads = downloadData?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;

      // Get bookmarks count
      const { data: bookmarksData, error: bookmarksError, count: bookmarksCount } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (bookmarksError) throw bookmarksError;

      res.json({
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        notesCount: notesCount || 0,
        totalDownloads: totalDownloads,
        bookmarksCount: bookmarksCount || 0
      });

    } catch (error) {
      console.error('Error fetching profile stats:', error);
      res.status(500).json({ error: 'Failed to fetch profile stats' });
    }
  }
};