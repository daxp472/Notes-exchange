import React, { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, Flag, TrendingUp, Shield } from 'lucide-react';
import { adminAPI, reportsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsResponse, reportsResponse] = await Promise.all([
        adminAPI.getAppStats(),
        reportsAPI.getAllReports('pending', 1)
      ]);
      
      setStats(statsResponse.stats);
      setReports(reportsResponse.reports || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, status: string) => {
    try {
      await reportsAPI.updateReportStatus(reportId, status);
      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, content, and monitor platform activity</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Dashboard
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Reports ({reports.length})
          </button>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="lg" className="text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                <p className="text-gray-600">Total Users</p>
                <p className="text-sm text-green-600 mt-1">+{stats.newUsersThisMonth} this month</p>
              </Card>

              <Card padding="lg" className="text-center">
                <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalNotes}</h3>
                <p className="text-gray-600">Total Notes</p>
                <p className="text-sm text-green-600 mt-1">+{stats.newNotesThisMonth} this month</p>
              </Card>

              <Card padding="lg" className="text-center">
                <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</h3>
                <p className="text-gray-600">Total Downloads</p>
              </Card>

              <Card padding="lg" className="text-center">
                <Flag className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-gray-900">{stats.pendingReports}</h3>
                <p className="text-gray-600">Pending Reports</p>
                <p className="text-sm text-gray-500 mt-1">{stats.totalReports} total</p>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Active Users */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold mb-4">Most Active Users</h3>
                <div className="space-y-3">
                  {stats.activeUsers?.map((user: any, index: number) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.college}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {user.contribution_score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Most Popular Notes */}
              <Card padding="lg">
                <h3 className="text-lg font-semibold mb-4">Most Popular Notes</h3>
                <div className="space-y-3">
                  {stats.popularNotes?.map((note: any, index: number) => (
                    <div key={note.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{note.title}</p>
                          <p className="text-sm text-gray-500">Rating: {note.rating}⭐</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {note.downloads} downloads
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reports.length === 0 ? (
              <Card padding="lg" className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reports</h3>
                <p className="text-gray-600">All reports have been reviewed!</p>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} padding="lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {report.reportedContentType.charAt(0).toUpperCase() + report.reportedContentType.slice(1)} Report
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Description:</strong> {report.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Reported by {report.reporter?.name} on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReportAction(report.id, 'reviewed')}
                      >
                        Mark Reviewed
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReportAction(report.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;