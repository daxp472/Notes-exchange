import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { SearchFilters } from '../../types';
import { useNotes } from '../../contexts/NotesContext';
import StarRating from '../ui/StarRating';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const { searchFilters, updateSearchFilters, resetFilters } = useNotes();
  const [localFilters, setLocalFilters] = useState<SearchFilters>(searchFilters);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Economics', 'Psychology', 'History', 'Literature', 'Philosophy',
    'Engineering', 'Medicine', 'Business Administration', 'Law'
  ];

  const courses = [
    'Calculus', 'Linear Algebra', 'Statistics', 'Organic Chemistry',
    'Data Structures', 'Algorithms', 'Machine Learning', 'Database Systems',
    'Operating Systems', 'Software Engineering', 'Web Development',
    'Mobile Development', 'Artificial Intelligence', 'Cybersecurity'
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    updateSearchFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    resetFilters();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Overlay for mobile */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl lg:relative lg:w-full lg:shadow-none border-l border-gray-200 lg:border-l-0 lg:border-r">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={localFilters.subject || ''}
                onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
                className="w-full input-field"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {/* Semester Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <select
                value={localFilters.semester || ''}
                onChange={(e) => handleFilterChange('semester', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full input-field"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Course Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={localFilters.course || ''}
                onChange={(e) => handleFilterChange('course', e.target.value || undefined)}
                className="w-full input-field"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <StarRating
                rating={localFilters.rating || 0}
                onRatingChange={(rating) => handleFilterChange('rating', rating)}
                size="md"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={localFilters.sortBy || 'recent'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full input-field"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={localFilters.sortOrder || 'desc'}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full input-field"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={applyFilters}
              className="w-full btn-primary"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="w-full btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;