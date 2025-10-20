import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Note, NotesContextType, SearchFilters } from '../types';
import { notesAPI } from '../services/api';

const NotesContext = createContext<NotesContextType | undefined>(undefined);

interface NotesProviderProps {
  children: ReactNode;
}

const defaultFilters: SearchFilters = {
  sortBy: 'recent',
  sortOrder: 'desc',
};

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(defaultFilters);

  const fetchNotes = useCallback(async (filters?: SearchFilters, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesAPI.getAllNotes({ ...searchFilters, ...filters }, page);
      setNotes(response.notes);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
      
      // Fetch favorites
      try {
        const favoritesResponse = await notesAPI.getFavorites();
        setFavorites(favoritesResponse.map((fav: any) => fav.note_id));
      } catch (favError) {
        // User might not be logged in, ignore favorites error
        console.log('Could not fetch favorites:', favError);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [searchFilters]);

  const fetchNoteById = async (noteId: string) => {
    try {
      setLoading(true);
      setError(null);
      const note = await notesAPI.getNoteById(noteId);
      return note;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch note');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadNote = async (noteData: any) => {
    const newNote = await notesAPI.uploadNote(noteData);
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = async (noteId: string) => {
    await notesAPI.deleteNote(noteId);
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const rateNote = async (noteId: string, rating: number, comment?: string) => {
    await notesAPI.rateNote(noteId, { rating, comment });
    // Refresh the note to get updated rating
    const updatedNote = await notesAPI.getNoteById(noteId);
    setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
  };

  const toggleFavorite = async (noteId: string) => {
    const isFavorited = favorites.includes(noteId);
    if (isFavorited) {
      await notesAPI.removeFavorite(noteId);
      setFavorites(prev => prev.filter(id => id !== noteId));
    } else {
      await notesAPI.addFavorite(noteId);
      setFavorites(prev => [...prev, noteId]);
    }
    
    // Update the note in the list
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isFavorited: !isFavorited } : note
    ));
  };

  const updateSearchFilters = (filters: SearchFilters) => {
    setSearchFilters(prev => ({ ...prev, ...filters }));
  };

  const resetFilters = () => {
    setSearchFilters(defaultFilters);
  };

  const value: NotesContextType = {
    notes,
    loading,
    error,
    currentPage,
    totalPages,
    favorites,
    searchFilters,
    fetchNotes,
    fetchNoteById,
    uploadNote,
    deleteNote,
    rateNote,
    toggleFavorite,
    updateSearchFilters,
    resetFilters,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};