import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Grid, 
  List, 
  Search, 
  Sparkles, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import NoteCard from '../components/notes/NoteCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NoteDetailsModal from '../components/notes/NoteDetailsModal';
import { ACADEMIC_DISCIPLINES } from '../utils/academicPrograms';

const NotesPage: React.FC = () => {
  const { noteId } = useParams<{ noteId?: string }>();
  const { notes, loading, error, currentPage, totalPages, fetchNotes, fetchNoteById } = useNotes();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>('All');

  useEffect(() => {
    if (noteId) {
      fetchNoteById(noteId).then(note => {
        if (note) {
          setSelectedNote(note);
          setShowDetails(true);
        }
      });
    }
  }, [noteId]);

  useEffect(() => {
    const filters: any = {};
    if (selectedSemester !== 'All') {
      filters.semester = parseInt(selectedSemester, 10);
    }
    if (selectedDiscipline !== 'All') {
      filters.course = selectedDiscipline;
    }
    if (searchQuery.trim()) {
      filters.subject = searchQuery.trim();
    }
    fetchNotes(filters, 1);
  }, [selectedDiscipline, selectedSemester]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: any = {};
    if (selectedSemester !== 'All') {
      filters.semester = parseInt(selectedSemester, 10);
    }
    if (selectedDiscipline !== 'All') {
      filters.course = selectedDiscipline;
    }
    if (searchQuery.trim()) {
      filters.subject = searchQuery.trim();
    }
    fetchNotes(filters, 1);
  };

  const handlePageChange = (page: number) => {
    const filters: any = {};
    if (selectedSemester !== 'All') filters.semester = parseInt(selectedSemester, 10);
    if (selectedDiscipline !== 'All') filters.course = selectedDiscipline;
    if (searchQuery.trim()) filters.subject = searchQuery.trim();
    fetchNotes(filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSelectedDiscipline('All');
    setSelectedSemester('All');
    setSearchQuery('');
    fetchNotes({}, 1);
  };

  const hasActiveFilters = selectedDiscipline !== 'All' || selectedSemester !== 'All' || searchQuery.trim() !== '';

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Academic Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Study Notes & Materials
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Browse, search, and download verified notes shared by students across colleges and semesters.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-2.5 rounded-xl border transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-2.5 rounded-xl border transition-all ${
                viewMode === 'list'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, title, or topic..."
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Semesters</option>
                {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                  <option key={sem} value={sem.toString()}>Semester {sem}</option>
                ))}
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-sm rounded-xl shadow-md transition-all whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>

          {/* Discipline Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDiscipline('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                selectedDiscipline === 'All'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              All Disciplines
            </button>
            {ACADEMIC_DISCIPLINES.map(disc => (
              <button
                key={disc}
                onClick={() => setSelectedDiscipline(disc)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedDiscipline === disc
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {disc}
              </button>
            ))}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors whitespace-nowrap ml-auto"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-red-50 border border-red-200 text-center space-y-2">
            <h3 className="text-base font-semibold text-red-800">Unable to Load Notes</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-gray-200 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No notes found</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search terms or clearing filters to see more results.'
                : 'No notes uploaded yet. Be the first to share study materials!'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {notes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 pt-6">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* In-App Reader Modal */}
      {selectedNote && (
        <NoteDetailsModal
          note={selectedNote}
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedNote(null);
          }}
          onSelectNote={(newNote) => {
            setSelectedNote(newNote);
          }}
        />
      )}
    </div>
  );
};

export default NotesPage;