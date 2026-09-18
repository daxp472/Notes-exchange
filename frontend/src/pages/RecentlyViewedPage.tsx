import React, { useState, useEffect } from 'react';
import { Clock, Download, Eye, Search, Calendar, User, Trash2 } from 'lucide-react';
import { quickWinsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface RecentlyViewedNote {
  id: string;
  viewedAt: string;
  note: {
    id: string;
    title: string;
    description: string;
    subject: string;
    semester: number;
    course: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    downloads: number;
    createdAt: string;
    uploaderName: string;
    uploaderCollege: string;
  };
}

const RecentlyViewedPage: React.FC = () => {
  const { user } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<RecentlyViewedNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecentlyViewed();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [recentlyViewed, searchTerm]);

  const fetchRecentlyViewed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quickWinsAPI.getRecentlyViewed();
      setRecentlyViewed(data.recentlyViewed || data || []);
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      setError('Failed to load recently viewed notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...recentlyViewed];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.note.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const downloadNote = async (noteId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/notes/${noteId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  const clearRecentlyViewed = async () => {
    try {
      const token = localStorage.getItem('token');
      // Note: You'd need to implement this endpoint in the backend
      const response = await fetch(`${API_BASE}/quick-wins/recently-viewed/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setRecentlyViewed([]);
      }
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const viewed = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - viewed.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return viewed.toLocaleDateString();
  };

  const groupByDate = (notes: RecentlyViewedNote[]) => {
    const groups: { [key: string]: RecentlyViewedNote[] } = {};
    
    notes.forEach(note => {
      const date = new Date(note.viewedAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(note);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedNotes = groupByDate(filteredNotes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🕒 Recently Viewed
            </h1>
            <p className="text-gray-600 mt-2">Your browsing history for quick access</p>
          </div>
          {recentlyViewed.length > 0 && (
            <button
              onClick={clearRecentlyViewed}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="glass-card p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search recently viewed notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredNotes.length} of {recentlyViewed.length} recently viewed notes
          </div>
        </div>

        {/* Recently Viewed Notes */}
        {filteredNotes.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No notes found' : 'No recently viewed notes'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start browsing notes to see your viewing history here'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotes).map(([date, notes]) => (
              <div key={date} className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  {date}
                </h2>
                
                <div className="space-y-3">
                  {notes.map((item) => (
                    <div key={`${item.note.id}-${item.viewedAt}`} className="glass-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start space-x-4">
                            {/* File Type Icon */}
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {item.note.fileType === 'application/pdf' ? 'PDF' : 'DOC'}
                              </span>
                            </div>
                            
                            {/* Note Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{item.note.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.note.description}</p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                  {item.note.subject}
                                </span>
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {item.note.uploaderName}
                                </span>
                                <span>{formatFileSize(item.note.fileSize)}</span>
                                <span>{item.note.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions and Time */}
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                              Viewed {getTimeAgo(item.viewedAt)}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => downloadNote(item.note.id, item.note.fileName)}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {recentlyViewed.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{recentlyViewed.length}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {[...new Set(recentlyViewed.map(item => item.note.subject))].length}
                </div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(recentlyViewed.map(item => item.note.uploaderName))].length}
                </div>
                <div className="text-sm text-gray-600">Contributors</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {recentlyViewed.filter(item => 
                    new Date(item.viewedAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Today</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewedPage;