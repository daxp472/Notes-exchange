// Analytics Controller - Dashboard Stats and Charts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const analyticsController = {
  // Get public platform statistics (for landing page / unauthenticated visitors)
  getPlatformStats: async (req, res) => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      // Get notes count & total downloads
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('downloads');

      if (notesError) throw notesError;

      // Get average rating
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating');

      if (ratingsError) throw ratingsError;

      const totalNotes = notesData ? notesData.length : 0;
      const totalDownloads = notesData ? notesData.reduce((sum, n) => sum + (n.downloads || 0), 0) : 0;
      const avgRating = ratingsData && ratingsData.length > 0
        ? ratingsData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsData.length
        : 0;

      res.json({
        totalUsers: userCount || 0,
        totalNotes,
        totalDownloads,
        averageRating: Math.round(avgRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      res.status(500).json({ error: 'Failed to fetch platform statistics' });
    }
  },

  // Get comprehensive dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user.id;

      // Get user activity count
      const { data: activityData, error: activityError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId);

      if (activityError) throw activityError;

      // Get user notes count
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, downloads')
        .eq('uploaded_by', userId);

      if (notesError) throw notesError;

      // Get user ratings received
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating')
        .in('note_id', notesData.map(note => note.id));

      if (ratingsError) throw ratingsError;

      // Get followers count
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('following_id', userId);

      if (followersError) throw followersError;

      // Get following count
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', userId);

      if (followingError) throw followingError;

      // Calculate stats
      const totalDownloads = notesData.reduce((sum, note) => sum + (note.downloads || 0), 0);
      const averageRating = ratingsData.length > 0 
        ? ratingsData.reduce((sum, rating) => sum + rating.rating, 0) / ratingsData.length 
        : 0;

      res.json({
        totalNotes: notesData.length,
        totalDownloads,
        totalActivities: activityData.length,
        averageRating: Math.round(averageRating * 10) / 10,
        followersCount: followersData.length,
        followingCount: followingData.length,
        totalRatings: ratingsData.length
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  },

  // Get study streaks from user activity
  getStudyStreaks: async (req, res) => {
    try {
      const { userId } = req.params;

      // Get user activities for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activities, error } = await supabase
        .from('user_activity')
        .select('created_at, action_type')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate study streaks
      const dailyActivity = {};
      activities.forEach(activity => {
        const date = new Date(activity.created_at).toDateString();
        if (!dailyActivity[date]) {
          dailyActivity[date] = 0;
        }
        dailyActivity[date]++;
      });

      // Calculate current streak
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        if (dailyActivity[dateString]) {
          if (i === 0 || tempStreak > 0) {
            tempStreak++;
            if (i === 0) currentStreak = tempStreak;
          }
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 0;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      res.json({
        currentStreak,
        longestStreak,
        dailyActivity,
        totalActiveDays: Object.keys(dailyActivity).length
      });

    } catch (error) {
      console.error('Error fetching study streaks:', error);
      res.status(500).json({ error: 'Failed to fetch study streaks' });
    }
  },

  // Get trending notes (most downloaded this week)
  getTrendingNotes: async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Get notes with activity in the last week
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity')
        .select('note_id, action_type')
        .eq('action_type', 'download')
        .gte('created_at', oneWeekAgo.toISOString());

      if (activitiesError) throw activitiesError;

      // Count downloads per note
      const downloadCounts = {};
      activities.forEach(activity => {
        if (activity.note_id) {
          downloadCounts[activity.note_id] = (downloadCounts[activity.note_id] || 0) + 1;
        }
      });

      // Get top 10 trending notes
      const trendingNoteIds = Object.entries(downloadCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([noteId]) => noteId);

      if (trendingNoteIds.length === 0) {
        return res.json([]);
      }

      // Get note details
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select(`
          id, title, subject, course, downloads, created_at,
          users:uploaded_by (id, name)
        `)
        .in('id', trendingNoteIds);

      if (notesError) throw notesError;

      // Add weekly download count to each note
      const trendingNotes = notesData.map(note => ({
        ...note,
        weeklyDownloads: downloadCounts[note.id] || 0
      })).sort((a, b) => b.weeklyDownloads - a.weeklyDownloads);

      res.json(trendingNotes);

    } catch (error) {
      console.error('Error fetching trending notes:', error);
      res.status(500).json({ error: 'Failed to fetch trending notes' });
    }
  },

  // Get contribution leaderboard
  getContributionLeaderboard: async (req, res) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, college, contribution_score')
        .order('contribution_score', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get additional stats for each user
      const leaderboard = await Promise.all(
        users.map(async (user) => {
          // Get notes count
          const { data: notesData } = await supabase
            .from('notes')
            .select('id')
            .eq('uploaded_by', user.id);

          // Get total downloads
          const { data: downloadData } = await supabase
            .from('notes')
            .select('downloads')
            .eq('uploaded_by', user.id);

          const totalDownloads = downloadData?.reduce((sum, note) => sum + (note.downloads || 0), 0) || 0;

          return {
            ...user,
            notesCount: notesData?.length || 0,
            totalDownloads
          };
        })
      );

      res.json(leaderboard);

    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch contribution leaderboard' });
    }
  },

  // Get weekly activity chart data
  getWeeklyActivity: async (req, res) => {
    try {
      const { userId } = req.params;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: activities, error } = await supabase
        .from('user_activity')
        .select('created_at, action_type')
        .eq('user_id', userId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group activities by day
      const dailyStats = {};
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateString = date.toDateString();
        
        dailyStats[dayName] = {
          date: dateString,
          uploads: 0,
          downloads: 0,
          views: 0,
          total: 0
        };
      }

      // Count activities by day
      activities.forEach(activity => {
        const activityDate = new Date(activity.created_at);
        const dayName = activityDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (dailyStats[dayName]) {
          dailyStats[dayName][activity.action_type] = (dailyStats[dayName][activity.action_type] || 0) + 1;
          dailyStats[dayName].total++;
        }
      });

      const chartData = Object.entries(dailyStats).map(([day, stats]) => ({
        day,
        ...stats
      }));

      res.json(chartData);

    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      res.status(500).json({ error: 'Failed to fetch weekly activity' });
    }
  },

  // Get monthly statistics
  getMonthlyStats: async (req, res) => {
    try {
      const { userId } = req.params;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Get user activities for the last month
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', oneMonthAgo.toISOString());

      if (activitiesError) throw activitiesError;

      // Get notes uploaded this month
      const { data: notesThisMonth, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('uploaded_by', userId)
        .gte('created_at', oneMonthAgo.toISOString());

      if (notesError) throw notesError;

      // Get ratings received this month
      const { data: ratingsThisMonth, error: ratingsError } = await supabase
        .from('ratings')
        .select('rating, created_at')
        .in('note_id', notesThisMonth.map(note => note.id))
        .gte('created_at', oneMonthAgo.toISOString());

      if (ratingsError) throw ratingsError;

      // Group activities by type
      const activityTypes = activities.reduce((acc, activity) => {
        acc[activity.action_type] = (acc[activity.action_type] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalActivities: activities.length,
        activityBreakdown: activityTypes,
        notesUploaded: notesThisMonth.length,
        ratingsReceived: ratingsThisMonth.length,
        averageRating: ratingsThisMonth.length > 0 
          ? ratingsThisMonth.reduce((sum, r) => sum + r.rating, 0) / ratingsThisMonth.length 
          : 0
      });

    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      res.status(500).json({ error: 'Failed to fetch monthly statistics' });
    }
  }
};