import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Download, 
  GraduationCap, 
  UserPlus, 
  UserMinus, 
  Users, 
  QrCode, 
  Lock, 
  Mail, 
  Award, 
  Sparkles,
  Calendar,
  X,
  Share2
} from 'lucide-react';
import { Note } from '../types';
import { notesAPI, userAPI, socialAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NoteCard from '../components/notes/NoteCard';
import QRShareModal from '../components/ui/QRShareModal';

interface ProfileData {
  id: string;
  name: string;
  email?: string;
  college?: string;
  studentId?: string;
  department?: string;
  semester?: number;
  bio?: string;
  contributionScore: number;
  badges: string[];
  isPrivate: boolean;
  showEmail: boolean;
  showFollowers: boolean;
  showFavorites: boolean;
  showActivity: boolean;
  createdAt?: string;
  totalNotes: number;
  totalDownloads: number;
  followersCount: number;
  followingCount: number;
  avatarUrl?: string;
  avatar_url?: string;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Follow list modals
  const [showFollowListModal, setShowFollowListModal] = useState<'followers' | 'following' | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [loadingFollowList, setLoadingFollowList] = useState(false);

  // QR Modal
  const [showQRModal, setShowQRModal] = useState(false);

  const isOwnProfile = currentUser && currentUser.id === userId;

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);

  const loadProfileData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [profileData, notesData] = await Promise.all([
        userAPI.getUserProfile(userId).catch(() => null),
        notesAPI.getAllNotes({ uploader: userId }, 1).catch(() => ({ notes: [] }))
      ]);

      if (profileData) {
        setProfile(profileData);
      } else {
        // Fallback profile if endpoint not available
        setProfile({
          id: userId,
          name: 'Student',
          college: 'University',
          contributionScore: 0,
          badges: [],
          isPrivate: false,
          showEmail: true,
          showFollowers: true,
          showFavorites: true,
          showActivity: true,
          totalNotes: notesData?.notes?.length || 0,
          totalDownloads: 0,
          followersCount: 0,
          followingCount: 0
        });
      }

      setNotes(notesData?.notes || []);

      // Check follow status if logged in and not self
      if (currentUser && currentUser.id !== userId) {
        try {
          const status = await socialAPI.getFollowStatus(userId);
          setIsFollowing(status?.isFollowing || false);
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!userId || !currentUser) {
      navigate('/login');
      return;
    }
    if (isOwnProfile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await socialAPI.unfollowUser(userId);
        setIsFollowing(false);
        setProfile(prev => prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : null);
        addToast({
          type: 'success',
          message: `Unfollowed ${profile?.name || 'student'}`
        });
      } else {
        await socialAPI.followUser(userId);
        setIsFollowing(true);
        setProfile(prev => prev ? { ...prev, followersCount: prev.followersCount + 1 } : null);
        addToast({
          type: 'success',
          message: `Now following ${profile?.name || 'student'}!`
        });
      }
    } catch (err: any) {
      console.error('Follow error:', err);
      addToast({
        type: 'error',
        message: 'Could not update follow status'
      });
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowList = async (type: 'followers' | 'following') => {
    if (!userId) return;
    if (profile?.isPrivate && !isOwnProfile && !isFollowing && !profile.showFollowers) {
      addToast({
        type: 'info',
        message: 'This student has hidden their network list.'
      });
      return;
    }

    setShowFollowListModal(type);
    setLoadingFollowList(true);
    try {
      const res = type === 'followers' 
        ? await socialAPI.getFollowers(userId)
        : await socialAPI.getFollowing(userId);
      setFollowList(res?.followers || res?.following || []);
    } catch (err) {
      console.error('Failed to load list:', err);
      setFollowList([]);
    } finally {
      setLoadingFollowList(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
        <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Student Not Found</h2>
          <p className="text-sm text-gray-500 mb-4">The profile you are looking for does not exist or may have been removed.</p>
          <button
            onClick={() => navigate('/notes')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm hover:bg-blue-700"
          >
            Browse Study Notes
          </button>
        </div>
      </div>
    );
  }

  const isRestrictedPrivate = profile.isPrivate && !isOwnProfile && !isFollowing;

  return (
    <div className="p-3 sm:p-4 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Bento Student Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 relative z-10">
            
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {profile.avatarUrl || (profile as any).avatar_url ? (
                    <img 
                      src={profile.avatarUrl || (profile as any).avatar_url} 
                      alt={profile.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-purple-600">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-400 rounded-lg text-white shadow-md" title="Active Campus Scholar">
                <Award className="w-4 h-4" />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{profile.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/60">
                      Verified Student
                    </span>
                    {profile.isPrivate && (
                      <span className="p-1 text-slate-400" title="Private Account">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                    <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{profile.college || 'University Student'}</span>
                    {profile.semester && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>Semester {profile.semester}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {!isOwnProfile ? (
                    <>
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center space-x-1.5 ${
                          isFollowing
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Follow Student</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => navigate(`/chat/private/${profile.id}`)}
                        className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center space-x-1.5"
                        title="Direct Message"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate('/settings')}
                      className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Edit Profile / Privacy
                    </button>
                  )}

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                    title="Share Profile QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bento Metric Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white text-sm mr-1">{profile.totalNotes}</span> Notes
                </div>

                <button
                  onClick={() => openFollowList('followers')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 text-slate-700 dark:text-slate-200 transition font-medium cursor-pointer group"
                >
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm mr-1">{profile.followersCount}</span> Followers
                </button>

                <button
                  onClick={() => openFollowList('following')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 text-slate-700 dark:text-slate-200 transition font-medium cursor-pointer group"
                >
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm mr-1">{profile.followingCount}</span> Following
                </button>

                {isOwnProfile && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 font-medium flex items-center gap-1">
                    <span className="font-bold text-sm">{profile.contributionScore || 10}</span> NoteCoins 🪙
                  </div>
                )}
              </div>

              {/* Bio & Badges */}
              {profile.bio && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line pt-1">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Restricted Profile Notice */}
        {isRestrictedPrivate ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">This Account is Private</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Follow {profile.name} to see their uploaded lecture notes, study materials, and academic resources.
            </p>
            <button
              onClick={handleFollowToggle}
              className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
            >
              + Follow Student
            </button>
          </div>
        ) : (
          /* Notes Showcase */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Uploaded Study Materials ({notes.length})</span>
              </h2>
            </div>

            {notes.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-2 shadow-sm">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-gray-900">No notes uploaded yet</h3>
                <p className="text-sm text-gray-500">
                  {isOwnProfile ? "You haven't uploaded any notes yet." : `${profile.name} hasn't uploaded study materials yet.`}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/upload')}
                    className="mt-3 px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl shadow-md"
                  >
                    Upload Your First Note
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Followers / Following List Modal */}
      {showFollowListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 capitalize">
                {showFollowListModal === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button
                onClick={() => setShowFollowListModal(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingFollowList ? (
                <div className="py-8 flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : followList.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  No {showFollowListModal} found.
                </div>
              ) : (
                followList.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setShowFollowListModal(null);
                      navigate(`/user/${item.id}`);
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                        {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.college || 'Student'}</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">View Profile →</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile QR Modal */}
      <QRShareModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title={`${profile.name}'s Student Profile`}
        url={`${window.location.origin}/user/${profile.id}`}
      />
    </div>
  );
};

export default UserProfilePage;