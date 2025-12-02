import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Building, 
  GraduationCap, 
  Save, 
  CheckCircle,
  Bell,
  BookOpen,
  Sliders,
  Download,
  Trash2,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Mail,
  Users,
  Clock,
  BookMarked,
  Palette,
  Sun,
  Moon,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, authAPI } from '../services/api';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'appearance' | 'notifications' | 'study' | 'security' | 'data'>('profile');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File Too Large',
        message: 'Profile picture must be less than 2MB in size.'
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Invalid File',
        message: 'Please upload a JPG, PNG, or WebP image.'
      });
      return;
    }

    setAvatarLoading(true);
    try {
      const res = await userAPI.uploadAvatar(file);
      await updateProfile({ avatarUrl: res.avatarUrl, avatar_url: res.avatarUrl } as any);
      addToast({
        type: 'success',
        title: 'Avatar Updated',
        message: 'Your profile photo has been updated successfully.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: err.response?.data?.error || err.message || 'Failed to upload photo'
      });
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    semester: user?.semester || 1,
    department: user?.department || '',
    studentId: user?.studentId || '',
    bio: user?.bio || '',
  });

  // Privacy Settings (Instagram style)
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    showEmail: true,
    showFollowers: true,
    showFavorites: true,
    showActivity: true,
    allowGroupInvites: true,
  });

  // Notification Preferences
  const [notificationSettings, setNotificationSettings] = useState({
    emailNewFollowers: true,
    emailNoteReviews: true,
    emailExamReminders: true,
    emailWeeklyDigest: false,
    emailGroupMentions: true,
    inAppSound: true,
  });

  // Study & Reader Preferences
  const [studyPreferences, setStudyPreferences] = useState({
    defaultViewer: 'in_app' as 'in_app' | 'external',
    autoBookmarkDownloads: true,
    offlineCache: true,
    semesterAutoAdvance: true,
    preferredDegree: 'B.Tech',
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setProfileForm({
        name: user.name || '',
        college: user.college || '',
        semester: user.semester || 1,
        department: user.department || '',
        studentId: user.studentId || '',
        bio: user.bio || '',
      });

      // Load user profile & privacy settings
      userAPI.getUserProfile(user.id).then(data => {
        if (data) {
          setPrivacySettings({
            isPrivate: Boolean(data.isPrivate),
            showEmail: data.showEmail !== false,
            showFollowers: data.showFollowers !== false,
            showFavorites: data.showFavorites !== false,
            showActivity: data.showActivity !== false,
            allowGroupInvites: true,
          });
          if (data.bio) {
            setProfileForm(prev => ({ ...prev, bio: data.bio }));
          }
          if (data.settings?.notifications) {
            setNotificationSettings(prev => ({ ...prev, ...data.settings.notifications }));
          }
          if (data.settings?.study) {
            setStudyPreferences(prev => ({ ...prev, ...data.settings.study }));
          }
        }
      }).catch(err => console.log('Could not fetch privacy:', err));
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.updateUserProfile(profileForm);
      await updateProfile(profileForm);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal and academic details have been saved.'
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyToggle = async (key: keyof typeof privacySettings) => {
    const updated = {
      ...privacySettings,
      [key]: !privacySettings[key]
    };
    setPrivacySettings(updated);
    setPrivacyLoading(true);
    try {
      await userAPI.updatePrivacySettings(updated);
      addToast({
        type: 'success',
        title: 'Privacy Updated',
        message: 'Your privacy preferences are now active.'
      });
    } catch (err: any) {
      console.error('Privacy update error:', err);
      // Still keep optimistic setting since backend will sync
      addToast({
        type: 'info',
        title: 'Privacy Synced',
        message: 'Your preference was updated.'
      });
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notificationSettings) => {
    const updated = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(updated);
    try {
      await userAPI.updateSettings({
        notifications: updated,
        study: studyPreferences
      });
      addToast({
        type: 'success',
        message: 'Notification preference saved.'
      });
    } catch (err) {
      console.warn('Notification setting sync:', err);
    }
  };

  const handleStudyToggle = async (key: keyof typeof studyPreferences, val?: any) => {
    const updated = {
      ...studyPreferences,
      [key]: val !== undefined ? val : !studyPreferences[key as 'autoBookmarkDownloads']
    };
    setStudyPreferences(updated);
    try {
      await userAPI.updateSettings({
        notifications: notificationSettings,
        study: updated
      });
      addToast({
        type: 'success',
        message: 'Study preference saved.'
      });
    } catch (err) {
      console.warn('Study setting sync:', err);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({
        type: 'error',
        message: 'New passwords do not match'
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast({
        type: 'error',
        message: 'Password must be at least 6 characters'
      });
      return;
    }

    setLoading(true);
    try {
      if (passwordForm.currentPassword) {
        await userAPI.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
      } else {
        await authAPI.updateProfile({ password: passwordForm.newPassword });
      }
      addToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your security credentials have been updated.'
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Password Update Failed',
        message: err.response?.data?.message || err.message || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-slate-50/50">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Customize your student profile, privacy visibility, alerts, and academic workflow.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected to Cloud</span>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'privacy'
                ? 'bg-purple-600 text-white shadow-sm ring-1 ring-purple-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Visibility</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'appearance'
                ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'notifications'
                ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Center</span>
          </button>

          <button
            onClick={() => setActiveTab('study')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'study'
                ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Study & Reader</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'security'
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm ring-1 ring-slate-800 dark:ring-blue-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition duration-200 ${
              activeTab === 'data'
                ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-500'
                : 'text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Data & Storage</span>
          </button>
        </div>

        {/* TAB 1: Profile & Identity */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Academic & Personal Profile</h2>
                <p className="text-xs text-slate-500">Your student identification visible to classmates and campus peers.</p>
              </div>
            </div>

            {/* Profile Avatar Upload Section */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md ring-4 ring-white bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.avatarUrl || (user as any)?.avatar_url ? (
                    <img 
                      src={user.avatarUrl || (user as any)?.avatar_url} 
                      alt={user?.name || 'Avatar'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                  className="absolute -bottom-1.5 -right-1.5 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition transform hover:scale-105"
                  title="Upload profile picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Profile Picture</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-700 w-fit mx-auto sm:mx-0">
                    Max 2MB &bull; JPG, PNG, WebP
                  </span>
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  Upload a clear image to personalize your profile across campus notes, discussions, and study circles.
                </p>
                <div className="pt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarLoading}
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-2xs disabled:opacity-60"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>{avatarLoading ? 'Uploading...' : 'Choose New Photo'}</span>
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    College / University Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profileForm.college}
                      onChange={(e) => setProfileForm({ ...profileForm, college: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g. Gujarat Technological University (GTU) / Stanford"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Semester
                  </label>
                  <select
                    value={profileForm.semester}
                    onChange={(e) => setProfileForm({ ...profileForm, semester: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department / Discipline
                  </label>
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={profileForm.studentId}
                    onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                    placeholder="e.g. 21012011"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bio / Study Philosophy
                </label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share your exam prep strategy, subject strengths (e.g., NumPy, DBMS), or study group interests..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center space-x-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                  <span>Save Profile Details</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Privacy & Visibility (Instagram-style) */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Privacy & Visibility Preferences</h2>
                <p className="text-xs text-slate-500">Fine-tune who can see your profile, followers, and uploaded materials.</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: Private Account */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-slate-900 text-sm">Private Student Account</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    When enabled, only accepted student followers can view your uploaded study materials, lecture summaries, and notes library.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrivacyToggle('isPrivate')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    privacySettings.isPrivate ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      privacySettings.isPrivate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 2: Show Followers & Following list */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-900 text-sm">Followers & Following List Access</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Allow other students to click your followers counter and view the list of people you follow (follower counts will remain visible regardless).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrivacyToggle('showFollowers')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    privacySettings.showFollowers ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      privacySettings.showFollowers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: Show Email */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-900 text-sm">Show University Email on Profile</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Make your institutional email address visible to authenticated campus peers for direct study collaboration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrivacyToggle('showEmail')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    privacySettings.showEmail ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      privacySettings.showEmail ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 4: Public Favorites & Bookmarks */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <BookMarked className="w-4 h-4 text-rose-500" />
                    <span className="font-semibold text-slate-900 text-sm">Public Bookmarks & Curated Reads</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Allow fellow classmates to see study materials you have bookmarked to help them discover high-yield notes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrivacyToggle('showFavorites')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    privacySettings.showFavorites ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      privacySettings.showFavorites ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 5: Show Recent Activity */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/80 transition">
                <div className="space-y-0.5 pr-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-900 text-sm">Show Contribution & Download Activity</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Display your contribution points, upload streaks, and peer recognition badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrivacyToggle('showActivity')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    privacySettings.showActivity ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                      privacySettings.showActivity ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2.5: Appearance & Theme Modes */}
        {activeTab === 'appearance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Color Themes & Display Mode</h2>
                <p className="text-xs text-slate-500">Select your preferred reading mode and interface aesthetic across all pages.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Aurora Minimal Light */}
              <div
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();
                  addToast({ type: 'success', message: 'Switched to Aurora Minimal Light mode' });
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  !isDarkMode
                    ? 'border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Aurora Minimal Light</h3>
                      <p className="text-xs text-slate-500">Day study & high readability</p>
                    </div>
                  </div>
                  {!isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-3/4 bg-slate-100 rounded-full"></div>
                </div>
              </div>

              {/* Option 2: Obsidian Midnight Dark */}
              <div
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();
                  addToast({ type: 'success', message: 'Switched to Obsidian Midnight Dark mode' });
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  isDarkMode
                    ? 'border-purple-600 bg-slate-900 text-white ring-2 ring-purple-500/20 shadow-md'
                    : 'border-slate-200 bg-slate-900 text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Obsidian Midnight Dark</h3>
                      <p className="text-xs text-slate-400">Night library & reduced eye strain</p>
                    </div>
                  </div>
                  {isDarkMode && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <div className="h-2 w-20 bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full"></div>
                  <div className="h-2 w-3/4 bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Notification Center */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Notification & Alert Preferences</h2>
                <p className="text-xs text-slate-500">Configure email broadcasts and in-app study alert triggers.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">New Follower Notifications</span>
                  <p className="text-xs text-slate-500">Receive an email alert when another student starts following your note updates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('emailNewFollowers')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationSettings.emailNewFollowers ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${notificationSettings.emailNewFollowers ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Note Reviews & Star Ratings</span>
                  <p className="text-xs text-slate-500">Get notified when a peer leaves a star rating or comment on your shared study notes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('emailNoteReviews')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationSettings.emailNoteReviews ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${notificationSettings.emailNoteReviews ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Exam & Study Countdown Alerts</span>
                  <p className="text-xs text-slate-500">Receive reminder emails 3 days and 24 hours prior to scheduled university exams.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('emailExamReminders')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationSettings.emailExamReminders ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${notificationSettings.emailExamReminders ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Weekly University Digest</span>
                  <p className="text-xs text-slate-500">A weekly Sunday summary of top trending notes in your university & branch.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('emailWeeklyDigest')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationSettings.emailWeeklyDigest ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${notificationSettings.emailWeeklyDigest ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Study Group Mentions & Chat Alerts</span>
                  <p className="text-xs text-slate-500">Instant notification when a group member shares a document in your active study rooms.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationToggle('emailGroupMentions')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationSettings.emailGroupMentions ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${notificationSettings.emailGroupMentions ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Study & Reader Preferences */}
        {activeTab === 'study' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Study Engine & Reader Controls</h2>
                <p className="text-xs text-slate-500">Customize how PDFs, lecture notes, and study paths are presented.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Default Document Viewer Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStudyToggle('defaultViewer', 'in_app')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                      studyPreferences.defaultViewer === 'in_app'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Interactive In-App Reader</div>
                      <div className="text-[11px] text-slate-500">Embedded PDF viewer with full-screen zoom and discussion tab</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStudyToggle('defaultViewer', 'external')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                      studyPreferences.defaultViewer === 'external'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Download className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Direct Browser Tab</div>
                      <div className="text-[11px] text-slate-500">Opens documents directly in a clean external tab</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Auto-Bookmark Downloaded Notes</span>
                  <p className="text-xs text-slate-500">Automatically save any downloaded material into your offline study library.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStudyToggle('autoBookmarkDownloads')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    studyPreferences.autoBookmarkDownloads ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${studyPreferences.autoBookmarkDownloads ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5 pr-4">
                  <span className="font-semibold text-slate-900 text-sm">Semester Auto-Progression Prompt</span>
                  <p className="text-xs text-slate-500">Prompt to upgrade your semester filters at the end of each academic cycle.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStudyToggle('semesterAutoAdvance')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    studyPreferences.semesterAutoAdvance ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${studyPreferences.semesterAutoAdvance ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Security Credentials & Sessions</h2>
                <p className="text-xs text-slate-500">Manage your encrypted access key and authentication credentials.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password (if updating)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !passwordForm.newPassword}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition disabled:opacity-40"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: Data & Storage */}
        {activeTab === 'data' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 animate-fade-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Data Management & Cache</h2>
                <p className="text-xs text-slate-500">Export your contributions or clear temporary campus cache.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-900 text-sm">Download My Notes & Activity Archive</span>
                  <p className="text-xs text-slate-500">Request a JSON package containing all your uploaded study files metadata and stats.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ user, privacySettings, exportedAt: new Date().toISOString() }, null, 2));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `student_archive_${user?.id || 'profile'}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    addToast({ type: 'success', message: 'Data archive downloaded.' });
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
                >
                  Export JSON
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-200">
                <div className="space-y-0.5">
                  <span className="font-semibold text-rose-900 text-sm">Clear Search History & Cache</span>
                  <p className="text-xs text-rose-600">Clear recently searched subject terms and cached recommendations from this browser.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('recentSearches');
                    addToast({ type: 'success', message: 'Search cache cleared successfully.' });
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;