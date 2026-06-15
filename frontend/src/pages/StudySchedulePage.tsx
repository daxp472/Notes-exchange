import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, AlertCircle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { studyScheduleAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Exam {
  id: string;
  subject: string;
  exam_date: string;
  exam_time?: string;
  duration?: string;
  syllabus?: string;
  notes?: string;
  daysUntil?: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  isToday?: boolean;
  isTomorrow?: boolean;
}

interface SuggestedNote {
  id: string;
  title: string;
  subject: string;
  relevanceScore: number;
  averageRating: number;
  downloads: number;
}

const StudySchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<any[]>([]);
  const [suggestedNotes, setSuggestedNotes] = useState<SuggestedNote[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExam, setNewExam] = useState({
    subject: '',
    exam_date: '',
    exam_time: '',
    duration: '',
    syllabus: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchExams(),
        fetchUpcomingExams()
      ]);
    } catch (error) {
      setError('Failed to load study schedule data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const data = await studyScheduleAPI.getExams();
      const raw = data?.exams || data || [];
      setExams(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.warn('Error fetching exams:', error);
      setExams([]);
    }
  };

  const fetchUpcomingExams = async () => {
    try {
      const data = await studyScheduleAPI.getUpcomingExams();
      const raw = data?.upcomingExams || data || [];
      setUpcomingExams(Array.isArray(raw) ? raw : []);
    } catch (error) {
      console.warn('Error fetching upcoming exams:', error);
      setUpcomingExams([]);
    }
  };

  const fetchSuggestedNotes = async (examId: string) => {
    try {
      const data = await studyScheduleAPI.getSuggestedNotes(examId);
      setSuggestedNotes(data.suggestedNotes || data || []);
    } catch (error) {
      console.error('Error fetching suggested notes:', error);
    }
  };

  const addExam = async () => {
    try {
      await studyScheduleAPI.createExam(newExam);
      setShowAddForm(false);
      setNewExam({ subject: '', exam_date: '', exam_time: '', duration: '', syllabus: '', notes: '' });
      await fetchData();
    } catch (error) {
      console.error('Error adding exam:', error);
      setError('Failed to add exam. Please try again.');
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      await studyScheduleAPI.deleteExam(examId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting exam:', error);
      setError('Failed to delete exam. Please try again.');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📅 Study Schedule
            </h1>
            <p className="text-gray-600 mt-2">Manage your exams and study plans</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Exam</span>
          </button>
        </div>

        {/* Upcoming Exams Alert */}
        {upcomingExams.length > 0 && (
          <div className="glass-card p-6 border-l-4 border-orange-500">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-800">Urgent Exams</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingExams.filter(exam => exam.urgency === 'critical' || exam.urgency === 'high').map((exam) => (
                <div key={exam.id} className={`p-4 rounded-lg border-2 ${getUrgencyColor(exam.urgency)}`}>
                  <h3 className="font-semibold">{exam.subject}</h3>
                  <p className="text-sm">
                    {exam.isToday ? 'Today!' : exam.isTomorrow ? 'Tomorrow!' : `${exam.daysUntil} days left`}
                  </p>
                  <p className="text-xs mt-1">{new Date(exam.exam_date).toLocaleDateString()}</p>
                  <button
                    onClick={() => {
                      setSelectedExam(exam.id);
                      fetchSuggestedNotes(exam.id);
                    }}
                    className="mt-2 text-xs bg-white/50 px-2 py-1 rounded"
                  >
                    Get Study Materials
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* All Exams List */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                All Scheduled Exams
              </h2>
              
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No exams scheduled yet</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    Add your first exam
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{exam.subject}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </span>
                            {exam.exam_time && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {exam.exam_time}
                              </span>
                            )}
                          </div>
                          {exam.syllabus && (
                            <p className="text-sm text-gray-600 mt-2">{exam.syllabus}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedExam(exam.id);
                              fetchSuggestedNotes(exam.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View suggested notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Suggested Notes */}
          <div>
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                Suggested Notes
              </h2>
              
              {selectedExam ? (
                suggestedNotes.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedNotes.slice(0, 5).map((note) => (
                      <div key={note.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <h4 className="font-medium text-gray-800 text-sm">{note.title}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-600">{note.subject}</span>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {note.relevanceScore}% match
                            </span>
                            <span className="text-yellow-600">★ {note.averageRating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No suggested notes found</p>
                )
              ) : (
                <p className="text-gray-500 text-sm">Select an exam to see suggested study materials</p>
              )}
            </div>
          </div>
        </div>

        {/* Add Exam Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Exam</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={newExam.subject}
                  onChange={(e) => setNewExam(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={newExam.exam_date}
                  onChange={(e) => setNewExam(prev => ({ ...prev, exam_date: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="time"
                  value={newExam.exam_time}
                  onChange={(e) => setNewExam(prev => ({ ...prev, exam_time: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Syllabus (optional)"
                  value={newExam.syllabus}
                  onChange={(e) => setNewExam(prev => ({ ...prev, syllabus: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addExam}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudySchedulePage;