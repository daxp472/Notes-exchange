import React, { useState, useEffect, useRef } from 'react';
import { User, Edit3, Mail, GraduationCap, Calendar, Award, BookOpen, Download, Star, Users, UserPlus, UserMinus, MessageCircle, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotes } from '../contexts/NotesContext';
import { socialAPI, userAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { notes } = useNotes();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [socialStats, setSocialStats] = useState({ followers: 0, following: 0 });
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'followers' | 'following'>('activity');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    college: user?.college || '',
    semester: user?.semester || 1,
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2 MB
    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Image Too Large',
        message: 'Profile picture must be less than 2MB in size.'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a JPG, PNG, or WebP image file.'
      });
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await userAPI.uploadAvatar(file);
      await updateProfile({ avatarUrl: res.avatarUrl, avatar_url: res.avatarUrl } as any);
      addToast({
        type: 'success',
        title: 'Profile Picture Updated',
        message: 'Your new avatar is now live across the platform.'
      });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.response?.data?.error || err.message || 'Failed to upload image'
      });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchSocialData();
    }
  }, [user]);

  const fetchSocialData = async () => {
    try {
      setSocialLoading(true);
      const [followersData, followingData, profileStats] = await Promise.all([
        socialAPI.getFollowers(user?.id || '').catch(() => []),
        socialAPI.getFollowing(user?.id || '').catch(() => []),
        socialAPI.getProfileStats(user?.id || '').catch(() => null)
      ]);
      setFollowers(followersData || []);
      setFollowing(followingData || []);
      setSocialStats({
        followers: followersData?.length || 0,
        following: followingData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await socialAPI.unfollowUser(userId);
      await fetchSocialData();
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const userNotes = notes.filter(note => note.uploadedBy === user?.id);
  const totalDownloads = userNotes.reduce((sum, note) => sum + note.downloads, 0);
  const averageRating = userNotes.length > 0 
    ? userNotes.reduce((sum, note) => sum + note.rating, 0) / userNotes.length 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value) || 1 : value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Profile Header Bento */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Avatar & Identifiers */}
            <div className="flex items-center space-x-5">
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer overflow-hidden relative group"
                  title="Click to change profile picture (Max 2MB)"
                >
                  {avatarUploading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : user.avatarUrl || (user as any).avatar_url || user.profileImage ? (
                    <img 
                      src={user.avatarUrl || (user as any).avatar_url || user.profileImage} 
                      alt={user.name} 
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" 
                    />
                  ) : (
                    <span className="text-3xl font-extrabold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  
                  {/* Camera Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white shadow-md border-2 border-white transition-all cursor-pointer"
                  title="Upload New Photo (Max 2MB)"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{user.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                    Verified Student
                  </span>
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <span>{user.college || 'University'}</span>
                  {user.semester && (
                    <>
                      <span>•</span>
                      <span>Semester {user.semester}</span>
                    </>
                  )}
                </p>
                
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2.5 self-stretch sm:self-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Edit3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => navigate('/rewards')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center space-x-1.5 shadow-md hover:shadow-lg"
              >
                <Award className="w-4 h-4 text-white" />
                <span>NoteCoins Store</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Notes</span>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{userNotes.length}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Uploaded to campus</div>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Downloads</span>
              <Download className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalDownloads}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Peer study accesses</div>
          </div>

          <div 
            onClick={() => setActiveTab('followers')}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Followers</span>
              <Users className="w-5 h-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{socialStats.followers}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">View classmates →</div>
          </div>

          <div 
            onClick={() => navigate('/rewards')}
            className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/60 shadow-2xs cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">NoteCoins Karma</span>
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-200 flex items-center gap-1">
              <span>{user.contributionScore || userNotes.length * 25 || 50}</span>
              <span className="text-base">🪙</span>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium mt-1">Redeem rewards →</div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'activity'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Uploaded Notes ({userNotes.length})
            </button>

            <button
              onClick={() => setActiveTab('followers')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'followers'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Followers ({socialStats.followers})
            </button>

            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                activeTab === 'following'
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Following ({socialStats.following})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {userNotes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userNotes.map(note => (
                    <div key={note.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/notes/${note.id}`)}>
                            {note.title}
                          </h3>
                          <p className="text-xs text-slate-500">{note.subject} • {note.course}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-[11px] font-bold">
                          {note.semester ? `Sem ${note.semester}` : 'Study'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            {note.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500" />
                            {note.rating?.toFixed(1) || '5.0'}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate(`/notes/${note.id}`)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          View Note →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                  <h3 className="font-semibold text-slate-900">No notes uploaded yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Upload your first lecture notes or exam summaries to earn NoteCoins and help your classmates.</p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-xs rounded-xl shadow-md"
                  >
                    Upload Notes Now
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              {socialLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : followers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {followers.map(follower => (
                    <div key={follower.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {follower.name ? follower.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{follower.name}</h4>
                          <p className="text-xs text-slate-500">{follower.college || 'Student'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/user/${follower.id}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200"
                      >
                        Profile
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No followers yet. Share your study notes to build your academic following!
                </div>
              )}
            </div>
          )}

          {activeTab === 'following' && (
            <div>
              {socialLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : following.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {following.map(person => (
                    <div key={person.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {person.name ? person.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{person.name}</h4>
                          <p className="text-xs text-slate-500">{person.college || 'Student'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUnfollow(person.id)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100"
                        >
                          Unfollow
                        </button>
                        <button
                          onClick={() => navigate(`/user/${person.id}`)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200"
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  You are not following anyone yet. Discover peer contributors on the Trending and Search pages!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Profile"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert
              type={message.type}
              dismissible
              onDismiss={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="College"
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
            leftIcon={<GraduationCap className="w-4 h-4" />}
          />

          <Input
            label="Semester"
            name="semester"
            type="number"
            min="1"
            max="8"
            value={formData.semester.toString()}
            onChange={handleChange}
            required
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;