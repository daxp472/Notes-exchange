// Quick Wins Controller - Recently viewed, search history, bulk download
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const quickWinsController = {
  // Get recently viewed notes
  getRecentlyViewed: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 10 } = req.query;

      const { data: recentlyViewed, error } = await supabase
        .from('recently_viewed_with_details')
        .select('*')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) {
        // Fallback to basic recently_viewed query if view is missing
        const { data: rawRecent, error: rawError } = await supabase
          .from('recently_viewed')
          .select('*, note:notes(*)')
          .eq('user_id', userId)
          .order('viewed_at', { ascending: false })
          .limit(parseInt(limit));

        if (!rawError && rawRecent) {
          return res.json(rawRecent);
        }
        return res.json([]);
      }

      res.json(recentlyViewed || []);

    } catch (error) {
      console.warn('Recently viewed query fallback:', error);
      res.json([]);
    }
  },

  // Add note to recently viewed
  addToRecentlyViewed: async (req, res) => {
    try {
      const userId = req.user.id;
      const { noteId } = req.params;

      const { error } = await supabase
        .from('recently_viewed')
        .upsert({
          user_id: userId,
          note_id: noteId,
          viewed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,note_id'
        });

      if (error) throw error;

      res.json({ message: 'Added to recently viewed' });

    } catch (error) {
      console.error('Error adding to recently viewed:', error);
      res.status(500).json({ error: 'Failed to add to recently viewed' });
    }
  },

  // Get search history
  getSearchHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20 } = req.query;

      const { data: searchHistory, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (error) throw error;

      res.json(searchHistory);

    } catch (error) {
      console.error('Error fetching search history:', error);
      res.status(500).json({ error: 'Failed to fetch search history' });
    }
  },

  // Add search to history
  addSearchHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { query, filters } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const { error } = await supabase
        .from('search_history')
        .insert([{
          user_id: userId,
          query: query.trim(),
          filters: filters || null
        }]);

      if (error) throw error;

      res.json({ message: 'Search added to history' });

    } catch (error) {
      console.error('Error adding to search history:', error);
      res.status(500).json({ error: 'Failed to add to search history' });
    }
  },

  // Delete search history item
  deleteSearchHistory: async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Search history item deleted' });

    } catch (error) {
      console.error('Error deleting search history item:', error);
      res.status(500).json({ error: 'Failed to delete search history item' });
    }
  },

  // Clear search history
  clearSearchHistory: async (req, res) => {
    try {
      const userId = req.user.id;

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Search history cleared' });

    } catch (error) {
      console.error('Error clearing search history:', error);
      res.status(500).json({ error: 'Failed to clear search history' });
    }
  },

  // Create bulk download (Cloudinary version)
  createBulkDownload: async (req, res) => {
    try {
      const userId = req.user.id;
      const { noteIds } = req.body;

      if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
        return res.status(400).json({ error: 'Note IDs are required' });
      }

      // Validate note IDs and get note details
      const { data: notes, error: notesError } = await supabase
        .from('notes')
        .select('id, title, file_name, file_path, file_size')
        .in('id', noteIds);

      if (notesError) throw notesError;

      if (notes.length === 0) {
        return res.status(404).json({ error: 'No valid notes found' });
      }

      // Create unique download ID
      const downloadId = uuidv4();
      const zipFileName = `notes_${downloadId}.zip`;
      const zipFilePath = path.join('uploads', 'bulk_downloads', zipFileName);

      // Ensure bulk_downloads directory exists
      const bulkDownloadsDir = path.join('uploads', 'bulk_downloads');
      if (!fs.existsSync(bulkDownloadsDir)) {
        fs.mkdirSync(bulkDownloadsDir, { recursive: true });
      }

      // Create zip file
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      archive.pipe(output);

      // For Cloudinary files, we need to download them first
      // This is a simplified approach - in production, you might want to stream directly
      const tempDir = path.join('uploads', 'temp', downloadId);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Download files from Cloudinary and add to archive
      for (const note of notes) {
        try {
          // Download file from Cloudinary
          const response = await axios({
            method: 'GET',
            url: note.file_path,
            responseType: 'stream'
          });

          const fileName = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}_${note.file_name}`;
          const tempFilePath = path.join(tempDir, fileName);
          
          // Save to temporary file
          const writer = fs.createWriteStream(tempFilePath);
          response.data.pipe(writer);
          
          // Wait for download to complete
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          // Add to archive
          archive.file(tempFilePath, { name: fileName });
        } catch (downloadError) {
          console.error(`Error downloading file for note ${note.id}:`, downloadError);
          // Continue with other files
        }
      }

      await archive.finalize();

      // Wait for the output stream to close
      await new Promise((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });

      // Clean up temporary files
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }

      // Record download activity
      for (const noteId of noteIds) {
        await supabase
          .from('user_activity')
          .insert([{
            user_id: userId,
            note_id: noteId,
            action_type: 'bulk_download'
          }]);

        // Increment download count
        await supabase
          .from('notes')
          .update({ downloads: supabase.raw('downloads + 1') })
          .eq('id', noteId);
      }

      res.json({
        downloadId,
        fileName: zipFileName,
        downloadUrl: `/api/quick-wins/bulk-download/${downloadId}`,
        notesCount: notes.length,
        totalSize: notes.reduce((sum, note) => sum + (note.file_size || 0), 0)
      });

    } catch (error) {
      console.error('Error creating bulk download:', error);
      res.status(500).json({ error: 'Failed to create bulk download' });
    }
  },

  // Get bulk download file
  getBulkDownload: async (req, res) => {
    try {
      const { downloadId } = req.params;
      const zipFileName = `notes_${downloadId}.zip`;
      const zipFilePath = path.join('uploads', 'bulk_downloads', zipFileName);

      if (!fs.existsSync(zipFilePath)) {
        return res.status(404).json({ error: 'Download file not found or expired' });
      }

      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error('Error sending bulk download:', err);
        } else {
          // Clean up file after download (optional)
          setTimeout(() => {
            if (fs.existsSync(zipFilePath)) {
              fs.unlinkSync(zipFilePath);
            }
          }, 5 * 60 * 1000); // Delete after 5 minutes
        }
      });

    } catch (error) {
      console.error('Error getting bulk download:', error);
      res.status(500).json({ error: 'Failed to get bulk download' });
    }
  },

  // Get enhanced user profile
  getEnhancedUserProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      // Get user basic info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user statistics
      const [
        { data: notesData, count: notesCount },
        { data: followersData, count: followersCount },
        { data: followingData, count: followingCount },
        { data: ratingsData },
        { data: activitiesData, count: activitiesCount }
      ] = await Promise.all([
        supabase.from('notes').select('id, downloads', { count: 'exact', head: true }).eq('uploaded_by', userId),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
        supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
        supabase.from('ratings').select('rating').in('note_id', 
          (await supabase.from('notes').select('id').eq('uploaded_by', userId)).data?.map(n => n.id) || []
        ),
        supabase.from('user_activity').select('id', { count: 'exact', head: true }).eq('user_id', userId)
      ]);

      // Calculate total downloads
      const { data: userNotes } = await supabase
        .from('notes')
        .select('downloads')
        .eq('uploaded_by', userId);

      const totalDownloads = userNotes?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;

      // Calculate average rating
      const averageRating = ratingsData?.length > 0 
        ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length 
        : 0;

      // Get recent activities
      const { data: recentActivities } = await supabase
        .from('user_activity')
        .select(`
          id, action_type, created_at,
          notes:note_id (id, title, subject)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get subject distribution
      const { data: subjectData } = await supabase
        .from('notes')
        .select('subject')
        .eq('uploaded_by', userId);

      const subjectDistribution = {};
      subjectData?.forEach(note => {
        if (note.subject) {
          subjectDistribution[note.subject] = (subjectDistribution[note.subject] || 0) + 1;
        }
      });

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          college: user.college,
          semester: user.semester,
          contributionScore: user.contribution_score,
          badges: user.badges || [],
          createdAt: user.created_at
        },
        stats: {
          notesCount: notesCount || 0,
          totalDownloads,
          followersCount: followersCount || 0,
          followingCount: followingCount || 0,
          averageRating: Math.round(averageRating * 10) / 10,
          totalActivities: activitiesCount || 0,
          ratingsReceived: ratingsData?.length || 0
        },
        recentActivities: recentActivities?.map(activity => ({
          id: activity.id,
          actionType: activity.action_type,
          createdAt: activity.created_at,
          note: activity.notes ? {
            id: activity.notes.id,
            title: activity.notes.title,
            subject: activity.notes.subject
          } : null
        })) || [],
        subjectDistribution
      });

    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  },

  // Get user activity feed
  getUserActivity: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      let activities = [];

      try {
        const { data: rawActivities, error } = await supabase
          .from('user_activity')
          .select(`
            id, action_type, created_at, points_earned,
            notes:note_id (id, title, subject, course)
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));

        if (!error && rawActivities && rawActivities.length > 0) {
          activities = rawActivities.map(a => ({
            id: a.id,
            actionType: a.action_type,
            createdAt: a.created_at,
            pointsEarned: a.points_earned || (a.action_type === 'upload' ? 25 : a.action_type === 'download' ? 5 : 2),
            note: a.notes ? {
              id: a.notes.id,
              title: a.notes.title,
              subject: a.notes.subject,
              course: a.notes.course
            } : null
          }));
        } else {
          // Construct fallback events from user's uploads/favorites if user_activity table is fresh
          const { data: userNotes } = await supabase
            .from('notes')
            .select('id, title, subject, course, created_at')
            .eq('uploaded_by', userId)
            .order('created_at', { ascending: false })
            .limit(5);

          if (userNotes && userNotes.length > 0) {
            activities = userNotes.map(n => ({
              id: n.id,
              actionType: 'upload',
              createdAt: n.created_at,
              pointsEarned: 25,
              note: {
                id: n.id,
                title: n.title,
                subject: n.subject,
                course: n.course
              }
            }));
          }
        }
      } catch (err) {
        console.warn('Activity fetch fallback:', err);
      }

      res.json(activities);

    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch user activity' });
    }
  }
};