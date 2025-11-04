import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Heart, 
  Star, 
  User, 
  Calendar, 
  FileText, 
  Tag, 
  BookOpen, 
  GraduationCap, 
  MessageCircle, 
  Share2, 
  Video, 
  Eye, 
  Maximize2, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Note, Rating, Comment } from '../../types';
import { notesAPI, socialAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotes } from '../../contexts/NotesContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import LoadingSpinner from '../ui/LoadingSpinner';
import QRShareModal from '../ui/QRShareModal';

interface NoteDetailsModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectNote?: (note: Note) => void;
}

const NoteDetailsModal: React.FC<NoteDetailsModalProps> = ({
  note,
  isOpen,
  onClose,
  onSelectNote,
}) => {
  const { user } = useAuth();
  const { toggleFavorite } = useNotes();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recommendations, setRecommendations] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reader' | 'video' | 'comments'>('reader');

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (note && isOpen) {
      fetchNoteDetails();
      fetchRecommendations();
      if (user && note.uploadedBy !== user.id) {
        checkFollowStatus();
      }
    }
  }, [note, isOpen, user]);

  const checkFollowStatus = async () => {
    if (!note || !user) return;
    try {
      const status = await socialAPI.getFollowStatus(note.uploadedBy);
      setIsFollowing(status.isFollowing);
    } catch (error) {
      console.error('Failed to check follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!note || !user) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await socialAPI.unfollowUser(note.uploadedBy);
        setIsFollowing(false);
        setMessage({ type: 'success', text: `Unfollowed ${note.uploaderName}` });
      } else {
        await socialAPI.followUser(note.uploadedBy);
        setIsFollowing(true);
        setMessage({ type: 'success', text: `Following ${note.uploaderName}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update follow status' });
    } finally {
      setFollowLoading(false);
    }
  };

  const fetchNoteDetails = async () => {
    if (!note) return;
    setLoading(true);
    try {
      const [ratingsData, commentsData] = await Promise.all([
        notesAPI.getRatings(note.id),
        notesAPI.getComments(note.id)
      ]);
      setRatings(ratingsData || []);
      setComments(commentsData || []);

      const existingRating = ratingsData?.find((r: Rating) => r.userId === user?.id);
      if (existingRating) {
        setUserRating(existingRating.rating);
        setUserComment(existingRating.comment || '');
      }
    } catch (error) {
      console.error('Failed to fetch note details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!note) return;
    try {
      const recs = await notesAPI.getRecommendations({
        noteId: note.id,
        subject: note.subject,
        semester: note.semester,
        limit: 4
      });
      setRecommendations(recs || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  const handleDownload = async () => {
    if (!note) return;
    try {
      await notesAPI.downloadNote(note.id);
      setMessage({ type: 'success', text: `Download started for "${note.title}"` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Download failed. Please try again.' });
    }
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !user || userRating === 0) return;

    setSubmittingRating(true);
    try {
      await notesAPI.rateNote(note.id, userRating, userComment);
      setMessage({ type: 'success', text: 'Thank you! Rating submitted.' });
      fetchNoteDetails();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit rating.' });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await notesAPI.addComment(note.id, newComment.trim());
      setNewComment('');
      setMessage({ type: 'success', text: 'Comment added to discussion.' });
      fetchNoteDetails();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add comment.' });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper to extract YouTube embed URL
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  if (!note || !isOpen) return null;

  const fileUrl = note.fileUrl || note.filePath || note.file_path || '';
  const isPdf = fileUrl.toLowerCase().includes('.pdf') || note.fileType?.includes('pdf') || note.file_type?.includes('pdf');
  const isImage = fileUrl.match(/\.(jpeg|jpg|png|webp|gif)/i) || note.fileType?.includes('image') || note.file_type?.includes('image');
  const youtubeEmbedUrl = getYouTubeEmbedUrl(note.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className={`relative w-full ${isFullscreen ? 'max-w-7xl h-[94vh]' : 'max-w-5xl max-h-[90vh]'} bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all duration-300`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold uppercase">
                {note.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                Semester {note.semester}
              </span>
              {note.category && (
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-500/10 border border-secondary-500/30 text-secondary-400 text-xs capitalize">
                  {note.category}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
              {note.title}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`px-6 py-2.5 text-xs font-medium flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border-b border-emerald-500/20' : 'bg-rose-500/15 text-rose-300 border-b border-rose-500/20'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6">
          <button
            onClick={() => setActiveTab('reader')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'reader'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Interactive Document Reader</span>
          </button>

          {youtubeEmbedUrl && (
            <button
              onClick={() => setActiveTab('video')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center space-x-2 transition ${
                activeTab === 'video'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Video Lecture Walkthrough</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center space-x-2 transition ${
              activeTab === 'comments'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Discussion ({comments.length})</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Document Reader */}
          {activeTab === 'reader' && (
            <div className="space-y-6">
              {/* In-App Interactive Viewer */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col min-h-[420px] max-h-[600px] justify-center items-center relative">
                {isPdf && fileUrl ? (
                  <div className="w-full flex flex-col h-[550px]">
                    <iframe
                      src={`${fileUrl}#toolbar=1`}
                      title={note.title}
                      className="w-full flex-1 border-none rounded-t-xl bg-white"
                    />
                    <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
                      <span>Interactive Document Viewer</span>
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 flex items-center space-x-1 font-medium transition-colors"
                      >
                        <span>Open in Separate Tab</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : isImage && fileUrl ? (
                  <div className="p-4 flex justify-center items-center w-full h-full overflow-auto">
                    <img 
                      src={fileUrl} 
                      alt={note.title} 
                      className="max-h-[500px] max-w-full rounded-xl object-contain shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Document Ready for Download</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                        This file format ({note.fileType || note.file_type || 'Document'}) can be viewed in your desktop app or downloaded directly.
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/30 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {note.fileName || note.file_name || 'Document'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Toolbar with Clickable Author */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div 
                  className="flex items-center space-x-3 cursor-pointer p-1.5 -m-1.5 rounded-xl hover:bg-slate-700/50 transition-all group"
                  onClick={() => {
                    if (note.uploadedBy) {
                      onClose();
                      navigate(`/user/${note.uploadedBy}`);
                    }
                  }}
                  title="Click to view full student profile"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                    {note.uploaderName ? note.uploaderName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white text-sm group-hover:text-primary-400 transition-colors">
                        {note.uploaderName || 'Student'}
                      </span>
                      {note.uploaderStudentId && (
                        <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-md font-mono">
                          ID: {note.uploaderStudentId}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{note.uploaderCollege || 'University'} • View Profile →</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user && note.uploadedBy !== user.id && (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                        isFollowing
                          ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'border-primary-500/30 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20'
                      }`}
                    >
                      {isFollowing ? 'Following' : '+ Follow Student'}
                    </button>
                  )}

                  <button
                    onClick={() => toggleFavorite(note.id)}
                    className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-700/60 text-rose-400 transition"
                    title="Bookmark Note"
                  >
                    <Heart className="w-4 h-4" fill={note.isFavorited ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-700/60 text-slate-300 transition"
                    title="Share QR Code"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-md shadow-primary-600/25 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Interactive Quick Star Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Rate Note:</span>
                  <StarRating
                    rating={userRating || note.rating || 0}
                    onRatingChange={async (newRating) => {
                      setUserRating(newRating);
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      try {
                        await notesAPI.rateNote(note.id, newRating);
                        setMessage({ type: 'success', text: `Rated ${newRating} / 5 stars! Thank you for your feedback.` });
                        fetchNoteDetails();
                      } catch (err) {
                        setMessage({ type: 'error', text: 'Failed to submit rating.' });
                      }
                    }}
                    readonly={false}
                    size="md"
                  />
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {note.rating ? `${note.rating.toFixed(1)} / 5.0` : 'No ratings yet'}
                  </span>
                  {note.ratingsCount ? (
                    <span className="text-xs text-slate-400">({note.ratingsCount} votes)</span>
                  ) : null}
                </div>
                
                <button
                  onClick={() => setActiveTab('comments')}
                  className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center space-x-1 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Write Review / Feedback →</span>
                </button>
              </div>

              {/* Description & Summary */}
              <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span>About this Study Material</span>
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {note.description}
                </p>

                {(note.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(note.tags || []).map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs border border-slate-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Video Lecture Walkthrough */}
          {activeTab === 'video' && youtubeEmbedUrl && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
                <iframe
                  src={youtubeEmbedUrl}
                  title="Educational Lecture Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-none"
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                Embedded video lecture provided by the contributor to guide you through this module.
              </p>
            </div>
          )}

          {/* TAB 3: Discussions & Rating Form */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Star Rating Section */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <h4 className="text-sm font-semibold text-white mb-2">Rate this Material</h4>
                <form onSubmit={handleRatingSubmit} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <StarRating
                      rating={userRating}
                      onRatingChange={setUserRating}
                      editable
                    />
                    <span className="text-xs text-slate-400 font-mono">({userRating} / 5 stars)</span>
                  </div>
                  <input
                    type="text"
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Add a review note (e.g. clear diagrams, exam-focused)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingRating || userRating === 0}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
                  >
                    {submittingRating ? 'Saving...' : 'Submit Rating'}
                  </button>
                </form>
              </div>

              {/* Add Comment */}
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ask a Question or Leave Feedback
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask about formulas, missing pages, or clarify steps..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Comments Thread */}
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-center py-8 text-sm text-slate-500">No questions or comments yet. Be the first to start the discussion!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{c.userName || 'Student'}</span>
                        <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* AI Smart Recommendations Section */}
          {recommendations.length > 0 && (
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span>AI Recommended Modules in {note.subject}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.map(rec => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      if (onSelectNote) {
                        onSelectNote(rec);
                      } else {
                        navigate(`/notes/${rec.id}`);
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-primary-500/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex-1 pr-3">
                      <h5 className="text-xs font-semibold text-white group-hover:text-primary-400 transition line-clamp-1">
                        {rec.title}
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        {rec.uploaderCollege} • Sem {rec.semester} • ⭐ {rec.rating || '5.0'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showQRModal && (
        <QRShareModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          noteTitle={note.title}
          noteId={note.id}
          url={`${window.location.origin}/notes/${note.id}`}
        />
      )}
    </div>
  );
};

export default NoteDetailsModal;