import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Star, 
  X, 
  Sparkles,
  ChevronRight,
  Lock,
  UserCheck
} from 'lucide-react';
import { searchAPI } from '../services/api';
import NoteCard from '../components/notes/NoteCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdvancedSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'notes' | 'users'>('all');
  const [results, setResults] = useState<{ notes: any[], users: any[], total: number }>({ notes: [], users: [], total: 0 });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [trendingNotes, setTrendingNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    subject: '',
    semester: '',
    course: '',
    rating: '',
  });

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (keyword.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [keyword]);

  const fetchTrending = async () => {
    try {
      const response = await searchAPI.getTrending('notes', 6);
      setTrendingNotes(response.trending || []);
    } catch (error) {
      console.warn('Failed to fetch trending:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await searchAPI.getSuggestions(keyword);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.warn('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = async (overrideKeyword?: string) => {
    const q = overrideKeyword !== undefined ? overrideKeyword : keyword;
    setLoading(true);
    setHasSearched(true);
    try {
      const searchParams = {
        q,
        type: searchType,
        ...filters
      };

      const response = await searchAPI.advancedSearch(searchParams);
      setResults(response.results || { notes: [], users: [], total: 0 });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({ subject: '', semester: '', course: '', rating: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Universal Study Search
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Find lecture notes, exam cheatsheets, verified syllabus materials, and campus contributors across universities.
          </p>
        </div>

        {/* Main Search Bar Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search subject (e.g. NumPy, DBMS), topic, university, or student name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-slate-900 font-semibold placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-inner"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-98"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Suggestions:</span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setKeyword(s);
                    handleSearch(s);
                  }}
                  className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold border border-blue-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Filter Bar & Category Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl">
              {(['all', 'notes', 'users'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSearchType(type);
                    if (hasSearched) handleSearch();
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    searchType === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {type === 'all' ? 'All Results' : type === 'notes' ? 'Study Notes' : 'Students / Peers'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                showFilters || Object.values(filters).some(Boolean)
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {Object.values(filters).filter(Boolean).length > 0 && `(${Object.values(filters).filter(Boolean).length})`}</span>
            </button>
          </div>

          {/* Expandable Advanced Filters */}
          {showFilters && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  value={filters.subject}
                  onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Semester</label>
                <select
                  value={filters.semester}
                  onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Any Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Min. Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4.0+ Stars ⭐⭐⭐⭐</option>
                  <option value="4.5">4.5+ Stars ⭐⭐⭐⭐⭐</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  onClick={() => handleSearch()}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-xl"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Results Area */}
        {hasSearched ? (
          <div className="space-y-6">
            {loading ? (
              <div className="py-16 text-center">
                <LoadingSpinner size="lg" />
                <p className="text-xs text-slate-500 mt-2">Searching study repository...</p>
              </div>
            ) : results.total === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No matching materials found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Try adjusting your search terms, subject name, or removing filters to broaden results.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Notes Results */}
                {(searchType === 'all' || searchType === 'notes') && results.notes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Study Materials ({results.notes.length})</span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.notes.map(note => (
                        <NoteCard key={note.id} note={note} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. User Profiles with Privacy Safeguard */}
                {(searchType === 'all' || searchType === 'users') && results.users.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>Student Contributors & Classmates ({results.users.length})</span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {results.users.map(u => (
                        <div
                          key={u.id}
                          onClick={() => navigate(`/user/${u.id}`)}
                          className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3 min-w-0 pr-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {u.name ? u.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition truncate">
                                  {u.name}
                                </h4>
                                {u.isPrivate && (
                                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" title="Private Profile" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 truncate">
                                {u.college || 'University'} • Sem {u.semester}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Default State: Trending Modules & Quick Discovery */
          <div className="space-y-6 pt-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Trending Study Modules</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendingNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvancedSearchPage;