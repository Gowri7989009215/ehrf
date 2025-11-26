import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, Users, FileText, Shield, Activity, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format, subDays, startOfDay } from 'date-fns';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/stats');
      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = () => {
    const stats = analyticsData?.userStats || [];
    return {
      patients: stats.find(s => s._id === 'patient')?.total || 0,
      doctors: stats.find(s => s._id === 'doctor')?.total || 0,
      hospitals: stats.find(s => s._id === 'hospital')?.total || 0,
      admins: stats.find(s => s._id === 'admin')?.total || 0
    };
  };

  const getConsentStats = () => {
    const stats = analyticsData?.consentStats || [];
    return {
      granted: stats.find(s => s._id === 'granted')?.count || 0,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      revoked: stats.find(s => s._id === 'revoked')?.count || 0
    };
  };

  const renderActivityChart = () => {
    const activityStats = analyticsData?.activityStats || [];
    if (!activityStats.length) return null;

    const maxCount = Math.max(...activityStats.flatMap(stat => stat.actions.map(a => a.count)));

    return (
      <div className="space-y-4">
        {activityStats.slice(-7).map((day, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-20 text-sm text-gray-600">
              {format(new Date(day._id.year, 0, day._id.date), 'MMM dd')}
            </div>
            <div className="flex-1 space-y-1">
              {day.actions.map((action, actionIndex) => (
                <div key={actionIndex} className="flex items-center space-x-2">
                  <div className="w-24 text-xs text-gray-600 truncate">
                    {action.action}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(action.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-xs text-gray-600 text-right">
                    {action.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  const userStats = getUserStats();
  const consentStats = getConsentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">System usage and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-input w-32"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.patients + userStats.doctors + userStats.hospitals + userStats.admins}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Medical Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.recordStats?.total || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blockchain Blocks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.blockchainStats?.totalBlocks || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Consents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {consentStats.granted}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Patients</span>
                </div>
                <span className="text-sm font-bold">{userStats.patients}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Doctors</span>
                </div>
                <span className="text-sm font-bold">{userStats.doctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm font-medium">Hospitals</span>
                </div>
                <span className="text-sm font-bold">{userStats.hospitals}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Admins</span>
                </div>
                <span className="text-sm font-bold">{userStats.admins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consent Status */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Consent Status</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Granted</span>
                </div>
                <span className="text-sm font-bold">{consentStats.granted}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <span className="text-sm font-bold">{consentStats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Revoked</span>
                </div>
                <span className="text-sm font-bold">{consentStats.revoked}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Records by Category */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Records by Category</h2>
        </div>
        <div className="card-body">
          {analyticsData?.recordStats?.byCategory?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsData.recordStats.byCategory.map((category, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {category._id.replace('-', ' ')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No record data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Trends */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Activity Trends</h2>
          <p className="text-sm text-gray-600">Daily activity breakdown for the last 7 days</p>
        </div>
        <div className="card-body">
          {analyticsData?.activityStats?.length > 0 ? (
            renderActivityChart()
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
        </div>
        <div className="card-body">
          {analyticsData?.recentRegistrations?.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.recentRegistrations.slice(0, 10).map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize text-gray-900">{user.role}</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent registrations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
