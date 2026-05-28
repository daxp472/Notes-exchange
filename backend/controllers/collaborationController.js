// Collaboration Controller - Comments, Ratings, Version Control
import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase.js';
import { createEnhancedNotification } from './notificationsEnhancedController.js';

export const collaborationController = {
  // Get comments for a note
  getComments: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { data: comments, error, count } = await supabase
        .from('comments')
        .select(`
          id, comment_text, created_at,
          users:user_id (id, name, college)
        `, { count: 'exact' })
        .eq('note_id', noteId)
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      if (error) throw error;

      const totalPages = Math.ceil(count / limit);

      res.json({
        comments: comments.map(comment => ({
          id: comment.id,
          text: comment.comment_text,
          createdAt: comment.created_at,
          user: {
            id: comment.users.id,
            name: comment.users.name,
            college: comment.users.college
          }
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalComments: count,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        }
      });

    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  },

  // Add comment to a note
  addComment: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { comment_text } = req.body;
      const userId = req.user.id;

      if (!comment_text || comment_text.trim().length === 0) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      if (comment_text.length > 1000) {
        return res.status(400).json({ error: 'Comment text is too long (max 1000 characters)' });
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .insert([{
          note_id: noteId,
          user_id: userId,
          comment_text: comment_text.trim()
        }])
        .select(`
          id, comment_text, created_at,
          users:user_id (id, name, college)
        `)
        .single();

      if (error) throw error;

      // Get note owner for notification
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('uploaded_by, title')
        .eq('id', noteId)
        .single();

      if (!noteError && note && note.uploaded_by !== userId) {
        // Get commenter name
        const { data: commenter } = await supabase
          .from('users')
          .select('name')
          .eq('id', userId)
          .single();

        if (commenter) {
          await createEnhancedNotification(
            note.uploaded_by,
            'comment',
            'New Comment',
            `${commenter.name} commented on your note "${note.title}"`,
            noteId,
            'note'
          );
        }
      }

      res.status(201).json({
        message: 'Comment added successfully',
        comment: {
          id: comment.id,
          text: comment.comment_text,
          createdAt: comment.created_at,
          user: {
            id: comment.users.id,
            name: comment.users.name,
            college: comment.users.college
          }
        }
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  },

  // Update comment
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { comment_text } = req.body;
      const userId = req.user.id;

      if (!comment_text || comment_text.trim().length === 0) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .update({ comment_text: comment_text.trim() })
        .eq('id', commentId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found or access denied' });
      }

      res.json({
        message: 'Comment updated successfully',
        comment
      });

    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  },

  // Delete comment
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Comment deleted successfully' });

    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  },

  // Get ratings for a note
  getRatings: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { page = 1, limit = 20, detailed = false } = req.query;

      if (detailed === 'true') {
        // Get detailed ratings with reviews
        const offset = (page - 1) * limit;

        const { data: ratings, error, count } = await supabase
          .from('ratings')
          .select(`
            id, rating, comment, created_at,
            users:user_id (id, name, college)
          `, { count: 'exact' })
          .eq('note_id', noteId)
          .order('created_at', { ascending: false })
          .range(offset, offset + parseInt(limit) - 1);

        if (error) throw error;

        const totalPages = Math.ceil(count / limit);

        res.json({
          ratings: ratings.map(rating => ({
            id: rating.id,
            rating: rating.rating,
            comment: rating.comment,
            createdAt: rating.created_at,
            user: {
              id: rating.users.id,
              name: rating.users.name,
              college: rating.users.college
            }
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRatings: count,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          }
        });
      } else {
        // Get rating summary
        const { data: ratings, error } = await supabase
          .from('ratings')
          .select('rating')
          .eq('note_id', noteId);

        if (error) throw error;

        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
          : 0;

        // Calculate rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => distribution[r.rating]++);

        res.json({
          summary: {
            totalRatings,
            averageRating: Math.round(averageRating * 10) / 10,
            distribution
          }
        });
      }

    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({ error: 'Failed to fetch ratings' });
    }
  },

  // Add rating to a note
  addRating: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if user already rated this note
      const { data: existingRating, error: checkError } = await supabase
        .from('ratings')
        .select('id')
        .eq('note_id', noteId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingRating) {
        return res.status(400).json({ error: 'You have already rated this note' });
      }

      const { data: newRating, error } = await supabase
        .from('ratings')
        .insert([{
          note_id: noteId,
          user_id: userId,
          rating,
          comment: comment || null
        }])
        .select(`
          id, rating, comment, created_at,
          users:user_id (id, name, college)
        `)
        .single();

      if (error) throw error;

      // Get note owner for notification
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('uploaded_by, title')
        .eq('id', noteId)
        .single();

      if (!noteError && note && note.uploaded_by !== userId) {
        // Get rater name
        const { data: rater } = await supabase
          .from('users')
          .select('name')
          .eq('id', userId)
          .single();

        if (rater) {
          await createEnhancedNotification(
            note.uploaded_by,
            'rating',
            'New Rating Received',
            `${rater.name} gave ${rating} stars to your note "${note.title}"`,
            noteId,
            'note'
          );
        }
      }

      res.status(201).json({
        message: 'Rating added successfully',
        rating: {
          id: newRating.id,
          rating: newRating.rating,
          comment: newRating.comment,
          createdAt: newRating.created_at,
          user: {
            id: newRating.users.id,
            name: newRating.users.name,
            college: newRating.users.college
          }
        }
      });

    } catch (error) {
      console.error('Error adding rating:', error);
      res.status(500).json({ error: 'Failed to add rating' });
    }
  },

  // Update rating
  updateRating: async (req, res) => {
    try {
      const { ratingId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const { data: updatedRating, error } = await supabase
        .from('ratings')
        .update({ rating, comment: comment || null })
        .eq('id', ratingId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      if (!updatedRating) {
        return res.status(404).json({ error: 'Rating not found or access denied' });
      }

      res.json({
        message: 'Rating updated successfully',
        rating: updatedRating
      });

    } catch (error) {
      console.error('Error updating rating:', error);
      res.status(500).json({ error: 'Failed to update rating' });
    }
  },

  // Delete rating
  deleteRating: async (req, res) => {
    try {
      const { ratingId } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', ratingId)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Rating deleted successfully' });

    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({ error: 'Failed to delete rating' });
    }
  },

  // Get versions of a note
  getVersions: async (req, res) => {
    try {
      const { noteId } = req.params;

      const { data: versions, error } = await supabase
        .from('note_versions')
        .select('*')
        .eq('note_id', noteId)
        .order('version_number', { ascending: false });

      if (error) throw error;

      res.json({
        versions: versions.map(version => ({
          id: version.id,
          versionNumber: version.version_number,
          filePath: version.file_path,
          createdAt: version.created_at,
          isLatest: version.version_number === Math.max(...versions.map(v => v.version_number))
        }))
      });

    } catch (error) {
      console.error('Error fetching versions:', error);
      res.status(500).json({ error: 'Failed to fetch versions' });
    }
  },

  // Upload new version of a note
  uploadVersion: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { fileUrl, description } = req.body;
      const userId = req.user.id;

      if (!fileUrl) {
        return res.status(400).json({ error: 'No file URL provided' });
      }

      // Check if user owns the note
      const { data: note, error: noteError } = await supabase
        .from('notes')
        .select('uploaded_by')
        .eq('id', noteId)
        .single();

      if (noteError) throw noteError;

      if (!note || note.uploaded_by !== userId) {
        return res.status(403).json({ error: 'Only note owner can upload new versions' });
      }

      // Get latest version number
      const { data: latestVersion, error: versionError } = await supabase
        .from('note_versions')
        .select('version_number')
        .eq('note_id', noteId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = (latestVersion?.version_number || 0) + 1;

      const { data: version, error } = await supabase
        .from('note_versions')
        .insert([{
          note_id: noteId,
          version_number: newVersionNumber,
          file_path: fileUrl,
          description: description || null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({
        message: 'New version uploaded successfully',
        version: {
          id: version.id,
          versionNumber: version.version_number,
          createdAt: version.created_at,
          isLatest: true
        }
      });

    } catch (error) {
      console.error('Error uploading version:', error);
      res.status(500).json({ error: 'Failed to upload new version' });
    }
  },

  // Download specific version
  downloadVersion: async (req, res) => {
    try {
      const { noteId, versionId } = req.params;

      const { data: version, error } = await supabase
        .from('note_versions')
        .select(`
          *,
          notes:note_id (title, file_name)
        `)
        .eq('id', versionId)
        .eq('note_id', noteId)
        .single();

      if (error) throw error;

      if (!version) {
        return res.status(404).json({ error: 'Version not found' });
      }

      // Return Cloudinary URL and original filename for frontend to handle
      res.json({ 
        fileUrl: version.file_path, 
        title: version.notes.title,
        fileName: version.notes.file_name
      });

    } catch (error) {
      console.error('Error downloading version:', error);
      res.status(500).json({ error: 'Failed to download version' });
    }
  },

  // Delete version
  deleteVersion: async (req, res) => {
    try {
      const { versionId } = req.params;
      const userId = req.user.id;

      // Check if user owns the note
      const { data: version, error: versionError } = await supabase
        .from('note_versions')
        .select(`
          *,
          notes:note_id (uploaded_by)
        `)
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      if (!version || version.notes.uploaded_by !== userId) {
        return res.status(403).json({ error: 'Only note owner can delete versions' });
      }

      // Don't allow deletion of the latest version if it's the only one
      const { data: allVersions, error: allVersionsError } = await supabase
        .from('note_versions')
        .select('version_number')
        .eq('note_id', version.note_id);

      if (allVersionsError) throw allVersionsError;

      const isLatestVersion = version.version_number === Math.max(...allVersions.map(v => v.version_number));
      
      if (isLatestVersion && allVersions.length === 1) {
        return res.status(400).json({ error: 'Cannot delete the only version of a note' });
      }

      const { error } = await supabase
        .from('note_versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;

      res.json({ message: 'Version deleted successfully' });

    } catch (error) {
      console.error('Error deleting version:', error);
      res.status(500).json({ error: 'Failed to delete version' });
    }
  }
};