import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Award, 
  BookOpen, 
  ArrowRight, 
  MessageCircle,
  TrendingUp,
  Users,
  Star,
  Clock,
  ChevronRight,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, quickWinsAPI } from '../services/api';
import NoteCard from '../components/notes/NoteCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage: React.FC = () => {
  const { notes, loading, fetchNotes } = useNotes();
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchNotes({ sortBy: 'recent', sortOrder: 'desc' }, 1);
    
    if (user?.id) {
      fetchDashboardStats();
      fetchRecentActivities();
    }
  }, [user?.id]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await analyticsAPI.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      if (!user?.id) return;
      const activities = await quickWinsAPI.getUserActivity(user.id);
      setRecentActivities(activities.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setRecentActivities([]);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Get activity icon, color, and points
  const getActivityIconAndColor = (actionType: string) => {
    switch (actionType) {
      case 'upload':
        return { icon: Upload, color: 'text-blue-600 bg-blue-50', badge: '+25 pts' };
      case 'favorite':
        return { icon: Star, color: 'text-amber-600 bg-amber-50', badge: '+2 pts' };
      case 'download':
        return { icon: Download, color: 'text-emerald-600 bg-emerald-50', badge: '+5 pts' };
      case 'rate':
        return { icon: Star, color: 'text-yellow-600 bg-yellow-50', badge: '+2 pts' };
      case 'unlock':
        return { icon: Zap, color: 'text-purple-600 bg-purple-50', badge: 'Unlocked' };
      default:
        return { icon: FileText, color: 'text-slate-600 bg-slate-50', badge: '+1 pt' };
    }
  };

  // Calculate trend percentage
  const calculateTrend = (current: number, previous: number) => {
    if (current === 0 && previous === 0) return 'No data';
    if (previous === 0) return current > 0 ? 'New' : 'No data';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${Math.round(change)}%`;
  };

  // Generate quick stats based on dashboard stats
  const quickStats = dashboardStats ? [
    { 
      title: 'My Notes', 
      value: (dashboardStats.totalNotes || 0).toString(), 
      change: (dashboardStats.totalNotes || 0) > 0 ? `+${dashboardStats.totalNotes} total` : 'No notes uploaded yet', 
      icon: FileText, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      trend: (dashboardStats.totalNotes || 0) > 0 ? `${dashboardStats.totalNotes} active` : 'Start sharing'
    },
    { 
      title: 'Downloads', 
      value: (dashboardStats.totalDownloads || 0).toString(), 
      change: (dashboardStats.totalDownloads || 0) > 0 ? `${dashboardStats.totalDownloads} total downloads` : 'No downloads yet', 
      icon: Download, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-600',
      trend: (dashboardStats.totalDownloads || 0) > 0 ? 'Growing' : '0'
    },
    { 
      title: 'NoteCoins', 
      value: `${user?.contributionScore || (dashboardStats.totalNotes || 0) * 25 || 50} 🪙`, 
      change: 'Campus Reward Karma', 
      icon: Award, 
      color: 'text-amber-600', 
      bgColor: 'bg-amber-50',
      gradientFrom: 'from-amber-500',
      gradientTo: 'to-amber-600',
      trend: 'Study Rewards'
    },
    { 
      title: 'Rating', 
      value: (dashboardStats.averageRating || 0) > 0 ? dashboardStats.averageRating.toFixed(1) : '5.0 ⭐', 
      change: (dashboardStats.totalRatings || 0) > 0 ? `${dashboardStats.totalRatings} reviews` : 'Top Scholar', 
      icon: Star, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-violet-600',
      trend: '⭐ Verified'
    }
  ] : [];

  const recentActivitiesData = recentActivities.map(activity => {
    const { icon, color, badge } = getActivityIconAndColor(activity.actionType);
    return {
      type: activity.actionType,
      title: activity.actionType === 'upload' 
        ? `Uploaded ${activity.note?.title || 'a study note'}` 
        : activity.actionType === 'favorite' 
        ? `Bookmarked ${activity.note?.title || 'a study note'}` 
        : activity.actionType === 'rate'
        ? `Rated ${activity.note?.title || 'a study note'}`
        : `Downloaded ${activity.note?.title || 'a study note'}`,
      time: formatTimeAgo(activity.createdAt || (activity as any).created_at || new Date().toISOString()),
      icon,
      color,
      badge: (activity as any).pointsEarned ? `+${(activity as any).pointsEarned} pts` : badge
    };
  });

  // Popular subjects derived dynamically from available notes
  const popularSubjects = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    notes.forEach(note => {
      if (note.subject) {
        counts[note.subject] = (counts[note.subject] || 0) + 1;
      }
    });
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'];
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }));
  }, [notes]);

  return (
    <div className="p-3 sm:p-4 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 bg-pattern-dots">
      {/* Welcome Section */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {user ? `Welcome back, ${user.name?.split(' ')[0]}!` : 'Welcome to NotesExchange'}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {user ? 'Here\'s what\'s happening with your notes today.' : 'Discover and share amazing study materials.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-4 lg:mt-0">
            <Link 
              to="/advanced-search" 
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-300/60 dark:border-slate-700/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 interactive-scale"
            >
              <Search className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              <span className="font-medium text-gray-700 dark:text-slate-200">Advanced Search</span>
            </Link>
            <Link 
              to="/upload" 
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 interactive-scale font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Notes</span>
            </Link>
          </div>
        </div>

        {/* Enhanced Quick Stats with Glass Morphism */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-slide-up">
            {statsLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/90 dark:to-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/60 animate-pulse"></div>
                  <div className="relative p-4 sm:p-6 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 sm:p-3 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="group relative">
                    {/* Background Glass Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/90 dark:to-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/60"></div>
                    
                    {/* Content */}
                    <div className="relative p-4 sm:p-6 h-full">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-semibold text-green-600 dark:text-emerald-400 bg-green-50 dark:bg-emerald-950/60 border border-green-200/50 dark:border-emerald-800/50 px-2 py-1 rounded-full">
                            {stat.trend}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                          {stat.value}
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {stat.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {stat.change}
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Enhanced Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Notes Section */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary-500" />
                <span>Recent Notes</span>
              </h2>
              <Link 
                to="/notes" 
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium transition-colors group"
              >
                <span>View All</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : notes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notes.slice(0, 4).map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-900 mb-1">No notes available yet</h3>
                <p className="text-sm text-gray-500 mb-4">Be the first to upload and share study materials with your classmates!</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload First Note</span>
                </Link>
              </div>
            )}
          </div>

          {/* Popular Subjects */}
          {popularSubjects.length > 0 && (
            <div className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <span>Popular Subjects</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularSubjects.map((subject, index) => (
                  <Link
                    key={index}
                    to={`/notes?search=${encodeURIComponent(subject.name)}`}
                    className="group relative overflow-hidden block"
                  >
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg group-hover:shadow-xl transition-shadow"></div>
                    
                    {/* Content */}
                    <div className="relative p-4 hover:-translate-y-1 transition-transform duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-8 ${subject.color} rounded-full`}></div>
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{subject.name}</h4>
                            <p className="text-sm text-gray-600">{subject.count} {subject.count === 1 ? 'note' : 'notes'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Recent Activity */}
          {user && (
            <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <div className="relative">
                {/* Background Glass Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/90 dark:to-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/60"></div>
                
                <div className="relative p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Recent Activity</span>
                  </h3>
                  
                  {recentActivitiesData.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivitiesData.map((activity, index) => {
                        const Icon = activity.icon;
                        return (
                          <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 transition shadow-2xs">
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <div className={`p-2 rounded-xl shrink-0 ${activity.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                                  {activity.title}
                                </p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                  {activity.time}
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 shrink-0 font-mono">
                              {activity.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-slate-400 text-sm">
                      <Clock className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="font-medium text-gray-600 dark:text-slate-300">No recent activity yet</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Activities will appear as you explore or upload notes</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-slate-700/60">
                    <Link 
                      to="/profile" 
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center space-x-1 group"
                    >
                      <span>View profile</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="relative">
              {/* Background Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-900/90 dark:to-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/60"></div>
              
              <div className="relative p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Quick Actions</span>
                </h3>
                
                <div className="space-y-3">
                  <Link
                    to="/upload"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl group"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Upload Notes</span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/chat"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl group"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Join Chat</span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/advanced-search"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:-translate-y-0.5 shadow-lg hover:shadow-xl group"
                  >
                    <Search className="w-5 h-5" />
                    <span className="font-medium">Advanced Search</span>
                    <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner for Non-Users */}
      {!user && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Start Sharing Knowledge Today</h2>
              <p className="text-blue-100 mb-6">Join students who are exchanging quality study notes across all subjects.</p>
              <Link 
                to="/register" 
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
        <div className="group relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 transform group-hover:scale-105 transition-transform duration-500"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Notes</h3>
            <p className="text-blue-100 text-sm mb-4">Share your study materials with the community and earn recognition</p>
            <Link 
              to="/upload" 
              className="text-white font-medium hover:underline flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300"
            >
              <span>Upload Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>

        <div className="group relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 transform group-hover:scale-105 transition-transform duration-500"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Browse Notes</h3>
            <p className="text-purple-100 text-sm mb-4">Explore thousands of high-quality notes from all subjects and courses</p>
            <Link 
              to="/notes" 
              className="text-white font-medium hover:underline flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300"
            >
              <span>Browse Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>

        <div className="group relative overflow-hidden">
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 transform group-hover:scale-105 transition-transform duration-500"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Join Chat</h3>
            <p className="text-green-100 text-sm mb-4">Connect with students and study groups for collaborative learning</p>
            <Link 
              to="/chat" 
              className="text-white font-medium hover:underline flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300"
            >
              <span>Start Chatting</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full transform translate-x-8 -translate-y-8"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;