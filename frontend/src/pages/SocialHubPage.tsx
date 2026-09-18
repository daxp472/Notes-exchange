import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Search, Eye, Award, BookOpen, Heart } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  contribution_score: number;
  notesCount: number;
  totalDownloads: number;
  followedAt?: string;
}

interface ProfileStats {
  followersCount: number;
  followingCount: number;
  notesCount: number;
  totalDownloads: number;
  bookmarksCount: number;
}

const SocialHubPage: React.FC = () => {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) return;

      // Fetch all social data in parallel
      const [followersRes, followingRes, statsRes] = await Promise.all([
        fetch(`/api/social/followers/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/social/following/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/social/profile-stats/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data.followers || []);
      }

      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowing(data.following || []);
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setProfileStats(stats);
      }

    } catch (error) {
      console.error('Error fetching social data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unfollowUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/unfollow/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFollowing(prev => prev.filter(user => user.id !== userId));
        if (profileStats) {
          setProfileStats(prev => prev ? { ...prev, followingCount: prev.followingCount - 1 } : null);
        }
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const followUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Refresh data
        fetchSocialData();
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const filteredUsers = (activeTab === 'followers' ? followers : following).filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            👥 Social Hub
          </h1>
          <p className="text-gray-600 mt-2">Connect with fellow learners</p>
        </div>

        {/* Stats Cards */}
        {profileStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-card p-6 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">{profileStats.followersCount}</h3>
              <p className="text-gray-600">Followers</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <UserPlus className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">{profileStats.followingCount}</h3>
              <p className="text-gray-600">Following</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">{profileStats.notesCount}</h3>
              <p className="text-gray-600">Notes Shared</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">{profileStats.totalDownloads}</h3>
              <p className="text-gray-600">Total Downloads</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-gray-800">{profileStats.bookmarksCount}</h3>
              <p className="text-gray-600">Bookmarks</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="glass-card p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'followers'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Followers ({followers.length})
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Following ({following.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'No users found matching your search' : `No ${activeTab} yet`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.college}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {activeTab === 'following' ? (
                        <button
                          onClick={() => unfollowUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => followUser(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-sm font-semibold text-blue-600">{user.contribution_score}</div>
                      <div className="text-xs text-gray-600">Score</div>
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-sm font-semibold text-green-600">{user.notesCount}</div>
                      <div className="text-xs text-gray-600">Notes</div>
                    </div>
                    <div className="p-2 bg-orange-50 rounded">
                      <div className="text-sm font-semibold text-orange-600">{user.totalDownloads}</div>
                      <div className="text-xs text-gray-600">Downloads</div>
                    </div>
                  </div>

                  {user.followedAt && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {activeTab === 'followers' ? 'Following since' : 'Followed since'} {new Date(user.followedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Search className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-medium">Discover Users</h3>
                <p className="text-sm text-gray-600">Find new people to follow</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Users className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <h3 className="font-medium">Browse Study Groups</h3>
                <p className="text-sm text-gray-600">Join collaborative groups</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <Award className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <h3 className="font-medium">Leaderboard</h3>
                <p className="text-sm text-gray-600">See top contributors</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialHubPage;