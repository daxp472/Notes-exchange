import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit3, Trash2, Eye, Download, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notesAPI } from '../services/api';
import { Note } from '../types';
import NoteCard from '../components/notes/NoteCard';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';

const MyNotesPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyNotes();
  }, [user]);

  const fetchMyNotes = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await notesAPI.getUserNotes(user.id);
      // Handle both direct array and object with notes property
      const notesArray = Array.isArray(response) ? response : (response.notes || []);
      setNotes(notesArray);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err: any) {
      console.error('Failed to delete note:', err);
      alert('Failed to delete note. Please try again.');
    }
  };

  const totalDownloads = Array.isArray(notes) ? notes.reduce((sum, note) => sum + note.downloads, 0) : 0;
  const averageRating = Array.isArray(notes) && notes.length > 0 
    ? notes.reduce((sum, note) => sum + note.rating, 0) / notes.length 
    : 0;
  const totalRatings = Array.isArray(notes) ? notes.reduce((sum, note) => sum + note.ratingsCount, 0) : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your uploaded notes.
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-primary-500 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            </div>
            <p className="text-gray-600">
              Manage your uploaded notes and track their performance
            </p>
          </div>
          <Link to="/upload">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-4 sm:mt-0"
            >
              Upload New Note
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="md" className="text-center">
            <BookOpen className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{notes.length}</h3>
            <p className="text-gray-600">Total Notes</p>
          </Card>

          <Card padding="md" className="text-center">
            <Download className="w-8 h-8 text-success-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{totalDownloads}</h3>
            <p className="text-gray-600">Total Downloads</p>
          </Card>

          <Card padding="md" className="text-center">
            <Star className="w-8 h-8 text-warning-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</h3>
            <p className="text-gray-600">Avg Rating</p>
          </Card>

          <Card padding="md" className="text-center">
            <Eye className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{totalRatings}</h3>
            <p className="text-gray-600">Total Ratings</p>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading your notes..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-error-500 mb-4">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notes</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchMyNotes}>
              Try Again
            </Button>
          </div>
        ) : notes.length > 0 ? (
          <div className="space-y-6">
            {/* Performance Overview */}
            {notes.length > 0 && (
              <Card padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Most Downloaded</h3>
                    {(() => {
                      const mostDownloaded = [...notes].sort((a, b) => b.downloads - a.downloads)[0];
                      return mostDownloaded ? (
                        <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                          <span className="font-medium text-success-900">{mostDownloaded.title}</span>
                          <Badge variant="success">{mostDownloaded.downloads} downloads</Badge>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No downloads yet</p>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Highest Rated</h3>
                    {(() => {
                      const highestRated = [...notes].sort((a, b) => b.rating - a.rating)[0];
                      return highestRated?.rating > 0 ? (
                        <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                          <span className="font-medium text-warning-900">{highestRated.title}</span>
                          <Badge variant="warning">★ {highestRated.rating.toFixed(1)}</Badge>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No ratings yet</p>
                      );
                    })()}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Most Recent</h3>
                    {(() => {
                      const mostRecent = [...notes].sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      )[0];
                      return mostRecent ? (
                        <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                          <span className="font-medium text-primary-900">{mostRecent.title}</span>
                          <Badge variant="primary">
                            {new Date(mostRecent.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </Card>
            )}

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map(note => (
                <div key={note.id} className="relative">
                  <NoteCard note={note} />
                  
                  {/* Action Buttons Overlay */}
                  <div className="absolute top-4 right-14 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white shadow-lg"
                      leftIcon={<Edit3 className="w-3 h-3" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="error"
                      className="bg-white shadow-lg"
                      leftIcon={<Trash2 className="w-3 h-3" />}
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No notes uploaded yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start sharing your knowledge with fellow students. Upload your first note and help others learn.
            </p>
            <Link to="/upload">
              <Button 
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                size="lg"
              >
                Upload Your First Note
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotesPage;