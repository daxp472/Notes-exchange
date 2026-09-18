import React, { useState, useEffect } from 'react';
import { Download, FileArchive, Trash2, Share2, RefreshCw, Search, Filter, CheckSquare, Square, AlertCircle, FileText, Clock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  semester: string;
  university: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  uploader_name: string;
  downloads: number;
  ratings: number;
  avg_rating: number;
}

interface BulkOperation {
  id: string;
  type: 'download' | 'delete' | 'share';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  notes_count: number;
  created_at: string;
}

const BulkToolsPage: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    fetchUserNotes();
  }, [user]);

  const fetchUserNotes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/notes?uploadedBy=${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const userNotes = Array.isArray(data) ? data : (data.notes || []);
        setNotes(userNotes);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || note.subject === filterSubject;
    const matchesSemester = !filterSemester || note.semester === filterSemester;
    
    return matchesSearch && matchesSubject && matchesSemester;
  });

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const selectAllNotes = () => {
    if (selectedNotes.size === filteredNotes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(filteredNotes.map(note => note.id)));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedNotes.size === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/notes/bulk-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          noteIds: Array.from(selectedNotes),
          userId: user?.id 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notes-bulk-${Date.now()}.zip`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        // Add to operations history
        const newOperation: BulkOperation = {
          id: Date.now().toString(),
          type: 'download',
          status: 'completed',
          progress: 100,
          notes_count: selectedNotes.size,
          created_at: new Date().toISOString()
        };
        setOperations(prev => [newOperation, ...prev]);
        setSelectedNotes(new Set());
      }
    } catch (error) {
      console.error('Bulk download failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkShare = async () => {
    if (selectedNotes.size === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/notes/bulk-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          noteIds: Array.from(selectedNotes),
          userId: user?.id 
        })
      });

      if (response.ok) {
        const { shareUrl } = await response.json();
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        
        // Add to operations history
        const newOperation: BulkOperation = {
          id: Date.now().toString(),
          type: 'share',
          status: 'completed',
          progress: 100,
          notes_count: selectedNotes.size,
          created_at: new Date().toISOString()
        };
        setOperations(prev => [newOperation, ...prev]);
        setSelectedNotes(new Set());
        
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Bulk share failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'download': return <Download className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return <FileArchive className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
            <FileArchive className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Bulk Tools</h1>
            <p className="text-purple-100">Manage multiple notes efficiently</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Download className="h-6 w-6 text-blue-300" />
              <div>
                <p className="text-2xl font-bold">{selectedNotes.size}</p>
                <p className="text-sm text-purple-100">Selected Notes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-green-300" />
              <div>
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-sm text-purple-100">Total Notes</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 text-yellow-300" />
              <div>
                <p className="text-2xl font-bold">{operations.length}</p>
                <p className="text-sm text-purple-100">Operations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulk Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleBulkDownload}
            disabled={selectedNotes.size === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Selected ({selectedNotes.size})
          </button>
          
          <button
            onClick={handleBulkShare}
            disabled={selectedNotes.size === 0 || loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Selected ({selectedNotes.size})
          </button>
          
          <button
            onClick={selectAllNotes}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {selectedNotes.size === filteredNotes.length ? <Square className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
            {selectedNotes.size === filteredNotes.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
          </select>
          
          <select
            value={filterSemester}
            onChange={(e) => setFilterSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Semesters</option>
            <option value="1st">1st Semester</option>
            <option value="2nd">2nd Semester</option>
            <option value="3rd">3rd Semester</option>
            <option value="4th">4th Semester</option>
            <option value="5th">5th Semester</option>
            <option value="6th">6th Semester</option>
            <option value="7th">7th Semester</option>
            <option value="8th">8th Semester</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes ({filteredNotes.length})</h2>
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 border rounded-lg transition-all cursor-pointer ${
                selectedNotes.has(note.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleNoteSelection(note.id)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {selectedNotes.has(note.id) ? (
                    <CheckSquare className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">{note.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{note.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {note.uploader_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(note.upload_date).toLocaleDateString()}
                        </span>
                        <span>{formatFileSize(note.file_size)}</span>
                        <span>{note.downloads} downloads</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {note.subject}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {note.semester}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredNotes.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notes found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Operations History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Operations</h2>
        <div className="space-y-3">
          {operations.map((operation) => (
            <div key={operation.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getOperationIcon(operation.type)}
                  <div>
                    <p className="font-medium text-gray-800 capitalize">
                      {operation.type} - {operation.notes_count} notes
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(operation.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${getStatusColor(operation.status)}`}>
                    {operation.status}
                  </span>
                  {operation.status === 'processing' && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${operation.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {operations.length === 0 && (
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No operations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkToolsPage;