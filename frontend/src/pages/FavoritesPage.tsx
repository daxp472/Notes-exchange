import React, { useEffect, useState } from 'react';
import { Heart, Search, Filter, Grid, List, BookOpen, Trash2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI } from '../services/api';
import { Note } from '../types';
import NoteCard from '../components/notes/NoteCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await notesAPI.getFavorites();
      setFavorites(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (noteId: string) => {
    if (!confirm('Remove this note from your favorites?')) {
      return;
    }
    
    try {
      await notesAPI.removeFavorite(noteId);
      setFavorites(prev => prev.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove from favorites. Please try again.');
    }
  };

  const handleClearAllFavorites = async () => {
    if (!confirm('Remove all notes from your favorites? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      // Remove all favorites one by one
      await Promise.all(favorites.map(note => notesAPI.removeFavorite(note.id)));
      setFavorites([]);
    } catch (err: any) {
      console.error('Failed to clear favorites:', err);
      setError('Failed to clear all favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = favorites.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(favorites.map(note => note.subject))).sort();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your favorite notes.
          </p>
          <Button variant="primary">
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-error-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">
            Your saved notes collection - easily access your most valuable study materials
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder="Search favorites by title, subject, course, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Subject Filter */}
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Subjects</option>
              {uniqueSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('grid')}
                leftIcon={<Grid className="w-4 h-4" />}
                size="sm"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
                leftIcon={<List className="w-4 h-4" />}
                size="sm"
              >
                List
              </Button>
            </div>
            
            {/* Clear All Button */}
            {favorites.length > 0 && (
              <Button
                variant="error"
                onClick={handleClearAllFavorites}
                leftIcon={<Trash2 className="w-4 h-4" />}
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card padding="md" className="text-center">
            <Heart className="w-6 h-6 text-error-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">{favorites.length}</h3>
            <p className="text-sm text-gray-600">Total Favorites</p>
          </Card>
          
          <Card padding="md" className="text-center">
            <BookOpen className="w-6 h-6 text-primary-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {new Set(favorites.map(note => note.subject)).size}
            </h3>
            <p className="text-sm text-gray-600">Subjects</p>
          </Card>
          
          <Card padding="md" className="text-center">
            <Filter className="w-6 h-6 text-secondary-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              {filteredFavorites.length}
            </h3>
            <p className="text-sm text-gray-600">Filtered Results</p>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading favorites..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-error-500 mb-4">
              <Heart className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Favorites</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchFavorites}>
              Try Again
            </Button>
          </div>
        ) : filteredFavorites.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }
          `}>
            {filteredFavorites.map(note => (
              <NoteCard 
                key={note.id} 
                note={note}
              />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No favorites yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your collection by clicking the heart icon on notes you find valuable. 
              They'll appear here for easy access.
            </p>
            <Button variant="primary">
              <Link to="/notes">Browse Notes</Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No matching favorites</h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search terms to find the notes you're looking for.
            </p>
            <Button 
              variant="secondary" 
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;