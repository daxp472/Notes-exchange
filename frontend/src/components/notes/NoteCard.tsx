import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Heart, Calendar, User, GraduationCap, QrCode, UserPlus, UserMinus } from 'lucide-react';
import { Note } from '../../types';
import { useNotes } from '../../contexts/NotesContext';
import { useAuth } from '../../contexts/AuthContext';
import { notesAPI, socialAPI } from '../../services/api';
import StarRating from '../ui/StarRating';
import NoteDetailsModal from './NoteDetailsModal';
import QRShareModal from '../ui/QRShareModal';

interface NoteCardProps {
  note: Note;
}

const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const { user } = useAuth();
  const { toggleFavorite } = useNotes();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Synchronize follow status on mount
  React.useEffect(() => {
    if (user && note.uploadedBy && note.uploadedBy !== user.id) {
      socialAPI.getFollowStatus(note.uploadedBy)
        .then(res => setIsFollowing(Boolean(res?.isFollowing)))
        .catch(() => {});
    }
  }, [user, note.uploadedBy]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notesAPI.downloadNote(note.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(note.id);
  };

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (note.uploadedBy === user.id) return;
    
    const nextState = !isFollowing;
    setIsFollowing(nextState); // Instant optimistic update
    setFollowLoading(true);
    try {
      if (nextState) {
        await socialAPI.followUser(note.uploadedBy);
      } else {
        await socialAPI.unfollowUser(note.uploadedBy);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      setIsFollowing(!nextState); // Revert on failure
    } finally {
      setFollowLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative h-full flex flex-col">
      <div
        className="card p-5 sm:p-6 cursor-pointer transform hover:scale-[1.015] hover:-translate-y-0.5 transition-all duration-300 animate-fade-in card-hover h-full flex flex-col justify-between border border-slate-200/80 bg-white rounded-2xl shadow-xs hover:shadow-md"
        onClick={handleCardClick}
      >
        {/* Top Info Section */}
        <div>
          {/* Header & Download CTA */}
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1 hover:text-blue-600 transition-colors" title={note.title}>
                {note.title}
              </h3>
            </div>
            
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(e);
                }}
                aria-label={`Download ${note.title}`}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs hover:shadow-sm transition-all"
                title={`Download ${note.title}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleFavorite}
                className={`p-2 rounded-xl border transition-colors ${
                  note.isFavorited
                    ? 'border-rose-200 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50'
                }`}
                title={note.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${note.isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Description (Consistent min-height) */}
          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-3 leading-relaxed">
            {note.description || 'Verified student study notes and exam preparation material.'}
          </p>

          {/* Tags (Consistent min-height) */}
          <div className="min-h-[26px] mb-3 flex flex-wrap items-center gap-1.5 overflow-hidden">
            {(note.tags || []).length > 0 ? (
              <>
                {(note.tags || []).slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] rounded-lg font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
                {(note.tags || []).length > 3 && (
                  <span className="text-[10px] text-slate-400 font-medium">+{(note.tags || []).length - 3}</span>
                )}
              </>
            ) : (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-medium">
                #study-pack
              </span>
            )}
          </div>

          {/* Academic Info Metadata (Consistent min-height) */}
          <div className="min-h-[22px] flex flex-wrap items-center gap-2 mb-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-slate-800 font-semibold truncate max-w-[130px]">{note.subject || 'General'}</span>
            </div>
            {note.semester && (
              <div className="flex items-center space-x-1">
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Sem {note.semester}</span>
              </div>
            )}
            {note.course && (
              <div className="flex items-center space-x-1">
                <span className="text-slate-300">•</span>
                <span className="truncate max-w-[110px] text-slate-500">{note.course}</span>
              </div>
            )}
          </div>

          {/* Rating & File Size */}
          <div className="flex items-center justify-between mb-3.5 pt-1">
            <div 
              className="flex items-center space-x-1 cursor-pointer hover:opacity-80 p-0.5 rounded transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
              title="Click to view reviews & rate"
            >
              <StarRating
                rating={note.rating || 5}
                readonly
                size="sm"
                showCount
                count={note.ratingsCount || 1}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{formatFileSize(note.fileSize || 0)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs min-w-0">
            <div 
              className="flex items-center space-x-1.5 cursor-pointer hover:text-blue-600 transition-colors group p-1 -ml-1 rounded-lg hover:bg-blue-50/60"
              onClick={(e) => {
                e.stopPropagation();
                if (note.uploadedBy) {
                  navigate(`/user/${note.uploadedBy}`);
                }
              }}
              title="View student profile"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-2xs group-hover:scale-105 transition-transform">
                {note.uploaderName ? note.uploaderName.charAt(0).toUpperCase() : <User className="w-3 h-3 text-white" />}
              </div>
              <span className="font-semibold text-slate-800 group-hover:text-blue-600 truncate max-w-[90px]">
                {note.uploaderName || 'Student'}
              </span>
            </div>
            
            {/* Follow Button */}
            {user && note.uploadedBy && note.uploadedBy !== user.id && (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                  isFollowing
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                }`}
              >
                {isFollowing ? (
                  <UserMinus className="w-3 h-3" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                <span>{isFollowing ? 'Following' : 'Follow'}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowQRModal(true);
              }}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center space-x-1 text-xs text-slate-500 font-mono">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>{note.downloads || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Details Modal */}
      <NoteDetailsModal
        note={note}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />

      {/* QR Share Modal */}
      <QRShareModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={note.title}
        url={`${window.location.origin}/notes/${note.id}`}
      />
    </div>
  );
};

export default NoteCard;