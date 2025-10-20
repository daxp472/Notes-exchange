import axios from 'axios';
import { User, Note, Rating, Comment, SearchFilters, RegisterData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – token might be invalid");
      // Don't redirect here
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.put('/auth/profile', userData);
    return data;
  },
};

// User Profile & Privacy API
export const userAPI = {
  getUserProfile: async (userId: string) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  updateUserProfile: async (profileData: any) => {
    const { data } = await api.put('/users/profile', profileData);
    return data;
  },

  updatePrivacySettings: async (privacyData: {
    isPrivate?: boolean;
    showEmail?: boolean;
    showFollowers?: boolean;
    showFavorites?: boolean;
    showActivity?: boolean;
  }) => {
    const { data } = await api.put('/users/privacy', privacyData);
    return data;
  },

  updateSettings: async (settings: any) => {
    const { data } = await api.put('/users/settings', { settings });
    return data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.put('/users/change-password', passwords);
    return data;
  },

  getUserStats: async () => {
    const { data } = await api.get('/users/stats');
    return data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};

export const notesAPI = {
  getAllNotes: async (filters?: SearchFilters, page = 1) => {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.semester) params.append('semester', filters.semester.toString());
    if (filters?.course) params.append('course', filters.course);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    params.append('page', page.toString());

    const { data } = await api.get(`/notes?${params.toString()}`);
    return data;
  },

  getNoteById: async (id: string): Promise<Note> => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },

  uploadNote: async (noteData: any): Promise<Note> => {
    const { data } = await api.post('/notes', noteData); // JSON POST
    return data;
  },

  updateNote: async (id: string, noteData: Partial<Note>): Promise<Note> => {
    const { data } = await api.put(`/notes/${id}`, noteData);
    return data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  downloadNote: async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/notes/${id}/download`);
      // Create a link element and trigger download with original filename
      const link = document.createElement('a');
      link.href = response.data.fileUrl;
      link.target = '_blank';
      link.download = response.data.fileName || 'note';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  rateNote: async (id: string, rating: number | { rating: number; comment?: string }, comment?: string) => {
    const payload = typeof rating === 'object' 
      ? { rating: Number(rating.rating), comment: rating.comment || '' } 
      : { rating: Number(rating), comment: comment || '' };
    const { data } = await api.post(`/notes/${id}/rate`, payload);
    return data;
  },

  getRatings: async (noteId: string): Promise<Rating[]> => {
    const { data } = await api.get(`/notes/${noteId}/ratings`);
    return data;
  },

  addFavorite: async (noteId: string) => {
    const { data } = await api.post(`/notes/${noteId}/favorite`);
    return data;
  },

  removeFavorite: async (noteId: string) => {
    await api.delete(`/notes/${noteId}/favorite`);
  },

  getFavorites: async () => {
    const { data } = await api.get('/notes/user/favorites');
    // Get favorite note IDs first
    const favoriteIds = data;

    // Then fetch full note details for each favorite
    if (favoriteIds && favoriteIds.length > 0) {
      const favoriteNotes = await Promise.all(
        favoriteIds.map(async (fav: any) => {
          try {
            const noteResponse = await api.get(`/notes/${fav.note_id}`);
            return { ...noteResponse.data, isFavorited: true };
          } catch (error) {
            console.error(`Failed to fetch note ${fav.note_id}:`, error);
            return null;
          }
        })
      );
      return favoriteNotes.filter(note => note !== null);
    }

    return [];
  },

  getComments: async (noteId: string): Promise<Comment[]> => {
    const { data } = await api.get(`/notes/${noteId}/comments`);
    // Handle both direct array and paginated response
    return Array.isArray(data) ? data : (data.comments || []);
  },

  addComment: async (noteId: string, comment: string): Promise<Comment> => {
    const { data } = await api.post(`/notes/${noteId}/comments`, { comment });
    return data.comment || data;
  },

  getUserNotes: async (userId: string, page = 1) => {
    const { data } = await api.get(`/notes/user/${userId}?page=${page}`);
    return data;
  },

  getRecommendations: async (params?: { noteId?: string; subject?: string; course?: string; semester?: number; discipline?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.noteId) searchParams.append('noteId', params.noteId);
    if (params?.subject) searchParams.append('subject', params.subject);
    if (params?.course) searchParams.append('course', params.course);
    if (params?.semester) searchParams.append('semester', params.semester.toString());
    if (params?.discipline) searchParams.append('discipline', params.discipline);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const { data } = await api.get(`/notes/recommendations?${searchParams.toString()}`);
    return data.recommendations || [];
  },

  getSeasonalTrends: async () => {
    const { data } = await api.get('/notes/trends/seasonal');
    return data;
  },
};

export const chatAPI = {
  // Private Chat
  getChatContacts: async () => {
    const { data } = await api.get('/chat/contacts');
    return data;
  },

  getPrivateMessages: async (userId: string, page = 1) => {
    const { data } = await api.get(`/chat/private/${userId}?page=${page}`);
    return data;
  },

  sendPrivateMessage: async (userId: string, content: string) => {
    const { data } = await api.post(`/chat/private/${userId}`, { content });
    return data;
  },

  // User Search
  searchUsers: async (query: string) => {
    const { data } = await api.get(`/chat/search-users?q=${encodeURIComponent(query)}`);
    return data;
  },

  // Group Chat
  createGroup: async (name: string, description?: string, members?: string[]) => {
    const { data } = await api.post('/chat/groups', { name, description, members });
    return data;
  },

  getUserGroups: async () => {
    const { data } = await api.get('/chat/groups');
    return data;
  },

  getGroupMessages: async (groupId: string, page = 1) => {
    const { data } = await api.get(`/chat/groups/${groupId}/messages?page=${page}`);
    return data;
  },

  sendGroupMessage: async (groupId: string, content: string) => {
    const { data } = await api.post(`/chat/groups/${groupId}/messages`, { content });
    return data;
  },

  getGroupMembers: async (groupId: string) => {
    const { data } = await api.get(`/chat/groups/${groupId}/members`);
    return data;
  },

  addGroupMember: async (groupId: string, userId: string) => {
    const { data } = await api.post(`/chat/groups/${groupId}/members`, { userId });
    return data;
  },

  removeGroupMember: async (groupId: string, userId: string) => {
    const { data } = await api.delete(`/chat/groups/${groupId}/members/${userId}`);
    return data;
  },

  leaveGroup: async (groupId: string) => {
    const { data } = await api.delete(`/chat/groups/${groupId}/leave`);
    return data;
  },

  updateGroup: async (groupId: string, name: string, description?: string) => {
    const { data } = await api.patch(`/chat/groups/${groupId}`, { name, description });
    return data;
  },

  deleteGroup: async (groupId: string) => {
    const { data } = await api.delete(`/chat/groups/${groupId}`);
    return data;
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (page = 1, unreadOnly = false) => {
    const { data } = await api.get(`/notifications?page=${page}&unreadOnly=${unreadOnly}`);
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/notifications/unread-count');
    return data;
  },

  markAsRead: async (notificationId: string) => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch('/notifications/mark-all-read');
    return data;
  },

  deleteNotification: async (notificationId: string) => {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  },
};

// Search API
export const searchAPI = {
  advancedSearch: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const { data } = await api.get(`/search?${queryString}`);
    return data;
  },

  getTrending: async (type = 'notes', limit = 10) => {
    const { data } = await api.get(`/search/trending?type=${type}&limit=${limit}`);
    return data;
  },

  getSuggestions: async (keyword: string) => {
    const { data } = await api.get(`/search/suggestions?q=${encodeURIComponent(keyword)}`);
    return data;
  },
};

// Reports API
export const reportsAPI = {
  createReport: async (contentType: string, contentId: string, reason: string, description?: string) => {
    const { data } = await api.post('/reports', { contentType, contentId, reason, description });
    return data;
  },

  getAllReports: async (status?: string, page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    if (status) params.append('status', status);
    const { data } = await api.get(`/reports?${params.toString()}`);
    return data;
  },

  updateReportStatus: async (reportId: string, status: string) => {
    const { data } = await api.patch(`/reports/${reportId}/status`, { status });
    return data;
  },

  getReportStats: async () => {
    const { data } = await api.get('/reports/stats');
    return data;
  },
};

// Analytics API
export const analyticsAPI = {
  getPlatformStats: async () => {
    const { data } = await api.get('/analytics/platform-stats');
    return data;
  },

  getDashboardStats: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  getStudyStreaks: async (userId: string) => {
    const { data } = await api.get(`/analytics/study-streaks/${userId}`);
    return data;
  },

  getTrendingNotes: async () => {
    const { data } = await api.get('/analytics/trending-notes');
    return data;
  },

  getContributionLeaderboard: async () => {
    const { data } = await api.get('/analytics/leaderboard');
    return data;
  },

  getWeeklyActivity: async (userId: string) => {
    const { data } = await api.get(`/analytics/weekly-activity/${userId}`);
    return data;
  },

  getMonthlyStats: async (userId: string) => {
    const { data } = await api.get(`/analytics/monthly-stats/${userId}`);
    return data;
  },
};

// Social API
export const socialAPI = {
  // Follow/Unfollow
  followUser: async (userId: string) => {
    const { data } = await api.post(`/social/follow/${userId}`);
    return data;
  },

  unfollowUser: async (userId: string) => {
    const { data } = await api.delete(`/social/unfollow/${userId}`);
    return data;
  },

  getFollowers: async (userId: string) => {
    const { data } = await api.get(`/social/followers/${userId}`);
    return data;
  },

  getFollowing: async (userId: string) => {
    const { data } = await api.get(`/social/following/${userId}`);
    return data;
  },

  getFollowStatus: async (userId: string) => {
    const { data } = await api.get(`/social/follow-status/${userId}`);
    return data;
  },

  // Study Groups
  createStudyGroup: async (groupData: any) => {
    const { data } = await api.post('/social/study-groups', groupData);
    return data;
  },

  getStudyGroups: async () => {
    const { data } = await api.get('/social/study-groups');
    return data;
  },

  getStudyGroup: async (groupId: string) => {
    const { data } = await api.get(`/social/study-groups/${groupId}`);
    return data;
  },

  updateStudyGroup: async (groupId: string, groupData: any) => {
    const { data } = await api.put(`/social/study-groups/${groupId}`, groupData);
    return data;
  },

  deleteStudyGroup: async (groupId: string) => {
    const { data } = await api.delete(`/social/study-groups/${groupId}`);
    return data;
  },

  joinStudyGroup: async (groupId: string) => {
    const { data } = await api.post(`/social/study-groups/${groupId}/join`);
    return data;
  },

  leaveStudyGroup: async (groupId: string) => {
    const { data } = await api.delete(`/social/study-groups/${groupId}/leave`);
    return data;
  },

  addNoteToGroup: async (groupId: string, noteId: string) => {
    const { data } = await api.post(`/social/study-groups/${groupId}/notes/${noteId}`);
    return data;
  },

  removeNoteFromGroup: async (groupId: string, noteId: string) => {
    const { data } = await api.delete(`/social/study-groups/${groupId}/notes/${noteId}`);
    return data;
  },

  // Bookmarks
  bookmarkNote: async (noteId: string) => {
    const { data } = await api.post(`/social/bookmarks/${noteId}`);
    return data;
  },

  removeBookmark: async (noteId: string) => {
    const { data } = await api.delete(`/social/bookmarks/${noteId}`);
    return data;
  },

  getUserBookmarks: async () => {
    const { data } = await api.get('/social/bookmarks');
    return data;
  },

  getProfileStats: async (userId: string) => {
    const { data } = await api.get(`/social/profile-stats/${userId}`);
    return data;
  },
};

// Study Schedule API
export const studyScheduleAPI = {
  getExams: async () => {
    const { data } = await api.get('/study-schedule/exams');
    return data;
  },

  createExam: async (examData: any) => {
    const { data } = await api.post('/study-schedule/exams', examData);
    return data;
  },

  updateExam: async (examId: string, examData: any) => {
    const { data } = await api.put(`/study-schedule/exams/${examId}`, examData);
    return data;
  },

  deleteExam: async (examId: string) => {
    const { data } = await api.delete(`/study-schedule/exams/${examId}`);
    return data;
  },

  getUpcomingExams: async () => {
    const { data } = await api.get('/study-schedule/upcoming');
    return data;
  },

  getSuggestedNotes: async (examId: string) => {
    const { data } = await api.get(`/study-schedule/suggested-notes/${examId}`);
    return data;
  },

  getStudyPlan: async (examId: string) => {
    const { data } = await api.get(`/study-schedule/study-plan/${examId}`);
    return data;
  },
};

// Quick Wins API
export const quickWinsAPI = {
  // Recently Viewed
  getRecentlyViewed: async () => {
    const { data } = await api.get('/quick-wins/recently-viewed');
    return data;
  },

  addToRecentlyViewed: async (noteId: string) => {
    const { data } = await api.post(`/quick-wins/recently-viewed/${noteId}`);
    return data;
  },

  // Search History
  getSearchHistory: async () => {
    const { data } = await api.get('/quick-wins/search-history');
    return data;
  },

  addSearchHistory: async (searchData: any) => {
    const { data } = await api.post('/quick-wins/search-history', searchData);
    return data;
  },

  deleteSearchHistory: async (id: string) => {
    const { data } = await api.delete(`/quick-wins/search-history/${id}`);
    return data;
  },

  clearSearchHistory: async () => {
    const { data } = await api.delete('/quick-wins/search-history');
    return data;
  },

  // Bulk Download
  createBulkDownload: async (noteIds: string[]) => {
    const { data } = await api.post('/quick-wins/bulk-download', { noteIds });
    return data;
  },

  getBulkDownload: async (downloadId: string) => {
    const response = await api.get(`/quick-wins/bulk-download/${downloadId}`, {
      responseType: 'blob',
    });
    return response;
  },

  // Enhanced User Profile
  getEnhancedUserProfile: async (userId: string) => {
    const { data } = await api.get(`/quick-wins/user-profile/${userId}`);
    return data;
  },

  getUserActivity: async (userId: string) => {
    const { data } = await api.get(`/quick-wins/user-activity/${userId}`);
    return data;
  },
};

// Smart Features API
export const smartFeaturesAPI = {
  checkDuplicate: async (fileUrl: string, title: string, description: string) => {
    const { data } = await api.post('/smart/check-duplicate', { fileUrl, title, description });
    return data;
  },

  generateSummary: async (content: string) => {
    const { data } = await api.post('/smart/generate-summary', { content });
    return data;
  },

  suggestCategory: async (title: string, description: string) => {
    const { data } = await api.post('/smart/suggest-category', { title, description });
    return data;
  },

  validateFile: async (fileUrl: string, fileName?: string, fileSize?: number, fileType?: string) => {
    const { data } = await api.post('/smart/validate-file', { fileUrl, fileName, fileSize, fileType });
    return data;
  },

  getAutoTags: async (subject: string) => {
    const { data } = await api.get(`/smart/auto-tags/${subject}`);
    return data;
  },
};

// Collaboration API
export const collaborationAPI = {
  // Comments
  getComments: async (noteId: string) => {
    const { data } = await api.get(`/collaboration/comments/${noteId}`);
    return data;
  },

  addComment: async (noteId: string, comment: string) => {
    const { data } = await api.post(`/collaboration/comments/${noteId}`, { comment });
    return data;
  },

  updateComment: async (commentId: string, comment: string) => {
    const { data } = await api.put(`/collaboration/comments/${commentId}`, { comment });
    return data;
  },

  deleteComment: async (commentId: string) => {
    const { data } = await api.delete(`/collaboration/comments/${commentId}`);
    return data;
  },

  // Ratings and Reviews
  getRatings: async (noteId: string) => {
    const { data } = await api.get(`/collaboration/ratings/${noteId}`);
    return data;
  },

  addRating: async (noteId: string, ratingData: any) => {
    const { data } = await api.post(`/collaboration/ratings/${noteId}`, ratingData);
    return data;
  },

  updateRating: async (ratingId: string, ratingData: any) => {
    const { data } = await api.put(`/collaboration/ratings/${ratingId}`, ratingData);
    return data;
  },

  deleteRating: async (ratingId: string) => {
    const { data } = await api.delete(`/collaboration/ratings/${ratingId}`);
    return data;
  },

  // Version Control
  getVersions: async (noteId: string) => {
    const { data } = await api.get(`/collaboration/versions/${noteId}`);
    return data;
  },

  uploadVersion: async (noteId: string, fileUrl: string, description?: string) => {
    const { data } = await api.post(`/collaboration/versions/${noteId}`, { fileUrl, description });
    return data;
  },

  downloadVersion: async (noteId: string, versionId: string) => {
    const response = await api.get(`/collaboration/versions/${noteId}/${versionId}/download`);
    // Create a link element and trigger download with original filename
    const link = document.createElement('a');
    link.href = response.data.fileUrl;
    link.target = '_blank';
    link.download = response.data.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  deleteVersion: async (versionId: string) => {
    const { data } = await api.delete(`/collaboration/versions/${versionId}`);
    return data;
  },
};

// Admin API
export const adminAPI = {
  getPreferences: async () => {
    const { data } = await api.get('/admin/preferences');
    return data;
  },

  updatePreferences: async (preferences: any) => {
    const { data } = await api.patch('/admin/preferences', preferences);
    return data;
  },

  getAppStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data;
  },
};

// Enhanced Notifications API
export const enhancedNotificationsAPI = {
  getRealtimeNotifications: async (lastCheckTime?: string) => {
    const { data } = await api.get(`/notifications-enhanced/realtime${lastCheckTime ? `?lastCheck=${lastCheckTime}` : ''}`);
    return data;
  },

  markBulkAsRead: async (notificationIds: string[]) => {
    const { data } = await api.patch('/notifications-enhanced/bulk-read', { notificationIds });
    return data;
  },

  getNotificationSettings: async () => {
    const { data } = await api.get('/notifications-enhanced/settings');
    return data;
  },

  updateNotificationSettings: async (settings: any) => {
    const { data } = await api.put('/notifications-enhanced/settings', settings);
    return data;
  },

  getNotificationsByType: async (type: string, page = 1) => {
    const { data } = await api.get(`/notifications-enhanced/type/${type}?page=${page}`);
    return data;
  },
};
