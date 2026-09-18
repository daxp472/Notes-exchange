import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkX, Download, Eye, Search, Filter, Calendar, User } from 'lucide-react';
import { socialAPI, notesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface BookmarkedNote {
  bookmarkId: string;
  bookmarkedAt: string;
  note: {
    id: string;
    title: string;
    description: string;
    subject: string;
    semester: number;
    course: string;
    tags: string[];
    fileName: string;
    fileSize: number;
    fileType: string;
    downloads: number;
    createdAt: string;
    uploaderName: string;
    uploaderCollege: string;
  };
}

const BookmarksPage: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkedNote[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkedNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'subject'>('recent');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookmarks();
  }, [currentPage]);

  useEffect(() => {
    filterBookmarks();
  }, [bookmarks, searchTerm, subjectFilter, sortBy]);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/bookmarks?page=${currentPage}&limit=12`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookmarks = () => {
    let filtered = [...bookmarks];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bookmark =>
        bookmark.note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.note.uploaderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (subjectFilter) {
      filtered = filtered.filter(bookmark => bookmark.note.subject === subjectFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.note.title.localeCompare(b.note.title));
        break;
      case 'subject':
        filtered.sort((a, b) => a.note.subject.localeCompare(b.note.subject));
        break;
    }

    setFilteredBookmarks(filtered);
  };

  const removeBookmark = async (noteId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/bookmarks/${noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.note.id !== noteId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const downloadNote = async (noteId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}/download`, {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(bookmarks.map(bookmark => bookmark.note.subject))];
    return subjects.filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🔖 Bookmarked Notes
          </h1>
          <p className="text-gray-600 mt-2">Your saved notes for quick access</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
              >
                <option value="">All Subjects</option>
                {getUniqueSubjects().map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'title' | 'subject')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="recent">Recently Bookmarked</option>
              <option value="title">Title A-Z</option>
              <option value="subject">Subject</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-600">
                {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {filteredBookmarks.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || subjectFilter ? 'No bookmarks found' : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || subjectFilter 
                ? 'Try adjusting your search or filters' 
                : 'Start bookmarking notes to see them here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.bookmarkId} className="glass-card p-6 hover:shadow-lg transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{bookmark.note.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{bookmark.note.description}</p>
                  </div>
                  <button
                    onClick={() => removeBookmark(bookmark.note.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove bookmark"
                  >
                    <BookmarkX className="w-4 h-4" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{bookmark.note.subject}</span>
                    <span className="text-gray-600">Semester {bookmark.note.semester}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="w-3 h-3 mr-1" />
                    <span>{bookmark.note.uploaderName}</span>
                    <span className="mx-2">•</span>
                    <span>{bookmark.note.uploaderCollege}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(bookmark.note.fileSize)}</span>
                    <span>{bookmark.note.downloads} downloads</span>
                  </div>
                </div>

                {/* Tags */}
                {bookmark.note.tags && bookmark.note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {bookmark.note.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {bookmark.note.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{bookmark.note.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadNote(bookmark.note.id, bookmark.note.fileName)}
                    className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button className="p-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Bookmark Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;