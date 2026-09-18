import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { SearchFilters } from '../types';
import NoteCard from '../components/notes/NoteCard';
import FilterSidebar from '../components/notes/FilterSidebar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notes, loading, fetchNotes, searchFilters, updateSearchFilters } = useNotes();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('q') || '');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      // Perform search with query
      performSearch(query);
    } else {
      // Load default notes
      fetchNotes();
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    // For now, we'll use the existing fetchNotes with filters
    // In a real app, you'd have a dedicated search API
    const filters: SearchFilters = {
      ...searchFilters,
      // Add search query to filters if your API supports it
    };
    await fetchNotes(filters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setSearchParams({ q: localSearchQuery.trim() });
    }
  };

  const sortOptions = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Most Downloaded', value: 'downloads' },
    { label: 'Title A-Z', value: 'title' },
  ];

  const orderOptions = [
    { label: 'Descending', value: 'desc', icon: <SortDesc className="w-4 h-4" /> },
    { label: 'Ascending', value: 'asc', icon: <SortAsc className="w-4 h-4" /> },
  ];

  const handleSortChange = (sortBy: string) => {
    updateSearchFilters({ sortBy: sortBy as any });
    fetchNotes({ ...searchFilters, sortBy: sortBy as any });
  };

  const handleOrderChange = (sortOrder: string) => {
    updateSearchFilters({ sortOrder: sortOrder as any });
    fetchNotes({ ...searchFilters, sortOrder: sortOrder as any });
  };

  // Filter notes based on search query (client-side filtering as fallback)
  const filteredNotes = query 
    ? notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.description.toLowerCase().includes(query.toLowerCase()) ||
        note.subject.toLowerCase().includes(query.toLowerCase()) ||
        note.course.toLowerCase().includes(query.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        note.uploaderName.toLowerCase().includes(query.toLowerCase())
      )
    : notes;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search Results for "${query}"` : 'All Notes'}
          </h1>
          <p className="text-gray-600">
            {query 
              ? `Found ${filteredNotes.length} notes matching your search`
              : 'Discover and download study notes from students'
            }
          </p>
        </div>

        {/* Search and Filters */}
        <Card padding="lg" className="mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search notes by title, subject, course, or keywords..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button type="submit" leftIcon={<Search className="w-4 h-4" />}>
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <Button
                variant="ghost"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Dropdown
                  items={sortOptions}
                  value={searchFilters.sortBy || 'recent'}
                  onChange={handleSortChange}
                  className="w-40"
                />
                <Dropdown
                  items={orderOptions}
                  value={searchFilters.sortOrder || 'desc'}
                  onChange={handleOrderChange}
                  className="w-32"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('grid')}
                leftIcon={<Grid className="w-4 h-4" />}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                onClick={() => setViewMode('list')}
                leftIcon={<List className="w-4 h-4" />}
              >
                List
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="Searching notes..." />
              </div>
            ) : filteredNotes.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {filteredNotes.length} of {notes.length} notes
                  </p>
                </div>

                {/* Notes Grid/List */}
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }
                `}>
                  {filteredNotes.map(note => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {query ? 'No results found' : 'No notes available'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {query 
                    ? `We couldn't find any notes matching "${query}". Try different keywords or check your spelling.`
                    : 'There are no notes available at the moment. Be the first to share your knowledge!'
                  }
                </p>
                {query && (
                  <div className="flex justify-center space-x-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setLocalSearchQuery('');
                        setSearchParams({});
                      }}
                    >
                      Clear Search
                    </Button>
                    <Button variant="primary">
                      Browse All Notes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <FilterSidebar isOpen={true} onClose={() => {}} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar isOpen={showFilters} onClose={() => setShowFilters(false)} />
    </div>
  );
};

export default SearchResultsPage;