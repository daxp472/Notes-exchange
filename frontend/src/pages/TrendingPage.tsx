import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Sparkles, 
  Search, 
  Download, 
  Star, 
  BookOpen, 
  Filter, 
  Layers
} from 'lucide-react';
import { searchAPI } from '../services/api';
import { Note } from '../types';
import NoteCard from '../components/notes/NoteCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const TrendingPage: React.FC = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [trendingNotes, setTrendingNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  useEffect(() => {
    loadTrending();
  }, [period]);

  const loadTrending = async () => {
    setLoading(true);
    try {
      const data = await searchAPI.getTrending('notes', 18, period);
      setTrendingNotes(data.trending || []);
    } catch (err) {
      console.warn('Failed to fetch trending notes:', err);
      setTrendingNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Distinct subjects for filtering
  const subjects = React.useMemo(() => {
    const subs = new Set<string>();
    trendingNotes.forEach(n => {
      if (n.subject) subs.add(n.subject);
    });
    return Array.from(subs);
  }, [trendingNotes]);

  const filteredNotes = trendingNotes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'all' || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>Campus Viral & Trending Notes</span>
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Most opened, downloaded, and highest-rated study materials across universities.
              </p>
            </div>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs self-start">
            {[
              { key: 'day', label: 'Today (24h)' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' },
              { key: 'all', label: 'All-Time' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setPeriod(t.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  period === t.key
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Subject Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search trending titles, subjects, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-white font-medium placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Subject Pills */}
          {subjects.length > 0 && (
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedSubject('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                  selectedSubject === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                    selectedSubject === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Calculating trending campus velocity...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No trending notes in this timeframe</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try selecting "This Month" or "All-Time" to view historical viral study modules.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default TrendingPage;