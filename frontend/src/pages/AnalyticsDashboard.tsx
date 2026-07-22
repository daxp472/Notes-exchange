import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  BookOpen, 
  Star, 
  Award, 
  Activity, 
  GraduationCap, 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  Calendar
} from 'lucide-react';
import { analyticsAPI, notesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  calculateStudentProgress, 
  getProgramByCode 
} from '../utils/academicPrograms';

interface DashboardStats {
  totalNotes: number;
  totalDownloads: number;
  totalActivities: number;
  averageRating: number;
  followersCount: number;
  followingCount: number;
  totalRatings: number;
}

interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  dailyActivity: Record<string, number>;
  totalActiveDays: number;
}

interface LeaderboardUser {
  id: string;
  name: string;
  college: string;
  contribution_score: number;
  notesCount: number;
  totalDownloads: number;
}

interface WeeklyActivity {
  day: string;
  uploads: number;
  downloads: number;
  views: number;
  total: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [studyStreaks, setStudyStreaks] = useState<StudyStreak | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivity[]>([]);
  const [seasonalData, setSeasonalData] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [upgradingSemester, setUpgradingSemester] = useState(false);

  const currentProgram = getProgramByCode(user?.department || user?.programCode || 'BCA');
  const studentProgress = calculateStudentProgress(user?.semester || 1, currentProgram.totalSemesters);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  const defaultWeeklyActivity = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      uploads: 0,
      downloads: 0,
      views: 0,
      total: 0
    }));
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [statsData, streaksData, leaderboardData, activityData, seasonalInfo] = await Promise.all([
        analyticsAPI.getDashboardStats().catch(() => null),
        analyticsAPI.getStudyStreaks(user?.id || '').catch(() => null),
        analyticsAPI.getContributionLeaderboard().catch(() => []),
        analyticsAPI.getWeeklyActivity(user?.id || '').catch(() => []),
        notesAPI.getSeasonalTrends().catch(() => null)
      ]);

      setDashboardStats(statsData || {
        totalNotes: 0,
        totalDownloads: 0,
        totalActivities: 0,
        averageRating: 0,
        followersCount: 0,
        followingCount: 0,
        totalRatings: 0
      });
      setStudyStreaks(streaksData || { currentStreak: 0, longestStreak: 0, dailyActivity: {}, totalActiveDays: 0 });
      setLeaderboard(leaderboardData || []);
      setWeeklyActivity(activityData && activityData.length > 0 ? activityData : defaultWeeklyActivity());
      setSeasonalData(seasonalInfo);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteSemester = async () => {
    if (!user || user.semester >= currentProgram.totalSemesters) return;
    setUpgradingSemester(true);
    try {
      const nextSem = user.semester + 1;
      await updateProfile({ semester: nextSem });
      addToast({
        type: 'success',
        title: 'Semester Upgraded!',
        message: `Congratulations on advancing to Semester ${nextSem}!`
      });
    } catch (err: any) {
      console.error('Failed to promote semester:', err);
      addToast({
        type: 'error',
        title: 'Upgrade Failed',
        message: 'Could not update semester. Please try again.'
      });
    } finally {
      setUpgradingSemester(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Academic Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Progress & Analytics
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Track your degree progression, study activity, contributor ranking, and subject trends.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3.5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <Flame className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Study Streak</div>
                <div className="text-base font-bold text-gray-900">
                  {studyStreaks?.currentStreak || 0} {studyStreaks?.currentStreak === 1 ? 'Day' : 'Days'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Student Degree Completion & Semester Progression */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentProgram.name} ({currentProgram.code})
                  </h2>
                  <p className="text-xs text-gray-500">
                    {currentProgram.discipline} • {currentProgram.durationYears} Years ({currentProgram.totalSemesters} Semesters)
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-gray-600">{studentProgress.label}</span>
                  <span className="font-bold text-blue-600 font-mono text-sm">{studentProgress.percentage}% Completed</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${studentProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Semester Promotion Action */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 lg:w-80 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Current Semester:</span>
                <span className="font-semibold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-xs">
                  Semester {user?.semester || 1} of {currentProgram.totalSemesters}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Semester Cycle:</span>
                <span className="text-gray-700 font-medium">6 Months</span>
              </div>

              <button
                onClick={handlePromoteSemester}
                disabled={upgradingSemester || (user?.semester || 1) >= currentProgram.totalSemesters}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  {user && user.semester >= currentProgram.totalSemesters 
                    ? 'Program Completed 🎉' 
                    : `Promote to Semester ${(user?.semester || 1) + 1}`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: Trending Seasons & Academic Surge Analytics */}
        {seasonalData?.season && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Current Academic Season</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{seasonalData.season.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{seasonalData.season.recommendation}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-purple-600 text-xs font-semibold uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>High-Demand Disciplines</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {seasonalData.season.hotDisciplines?.map((d: string) => (
                  <span key={d} className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-xs text-purple-700 font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-600 text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Trending Topics</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {seasonalData.season.peakSubjects?.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-800 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Key Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardStats?.totalNotes || 0}</div>
              <div className="text-xs text-gray-500">Notes Uploaded</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dashboardStats?.totalDownloads || 0}</div>
              <div className="text-xs text-gray-500">Total Downloads</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardStats?.averageRating && dashboardStats.averageRating > 0 
                  ? `${dashboardStats.averageRating.toFixed(1)} ★` 
                  : 'N/A'}
              </div>
              <div className="text-xs text-gray-500">Average Rating</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{user?.contributionScore || 0}</div>
              <div className="text-xs text-gray-500">Contribution Points</div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Activity Chart & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Trends */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Weekly Activity</span>
              </h3>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                  />
                  <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Views" />
                  <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]} name="Downloads" />
                  <Bar dataKey="uploads" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Uploads" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Contribution Leaderboard */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Campus Leaderboard</span>
            </h3>

            <div className="space-y-2.5">
              {leaderboard.length === 0 ? (
                <div className="text-center py-10 text-xs text-gray-400">
                  <Award className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p>No ranked contributors yet.</p>
                  <p className="mt-0.5">Upload notes to climb the leaderboard!</p>
                </div>
              ) : (
                leaderboard.slice(0, 5).map((lUser, idx) => (
                  <div key={lUser.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-400 text-white shadow-xs' : idx === 1 ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{lUser.name}</div>
                        <div className="text-[11px] text-gray-500">{lUser.college}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {lUser.contribution_score} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;