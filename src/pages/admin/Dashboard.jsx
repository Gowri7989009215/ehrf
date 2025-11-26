import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Shield,
  Users,
  Activity,
  AlertTriangle,
  UserCheck,
  BarChart3,
  TrendingUp,
  Clock,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const { statistics, recentAlerts, recentActivity } = dashboardData || {};

  const statCards = [
    {
      title: 'Pending Approvals',
      value: statistics?.pendingApprovals || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      link: '/admin/verify'
    },
    {
      title: 'Total Users',
      value: statistics?.userCounts?.reduce((sum, item) => sum + item.count, 0) || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Security Alerts',
      value: recentAlerts?.length || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Blockchain Blocks',
      value: statistics?.blockchainStats?.totalBlocks || 0,
      icon: Shield,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System administration and monitoring</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const CardComponent = stat.link ? Link : 'div';
          const cardProps = stat.link ? { to: stat.link } : {};
          
          return (
            <CardComponent
              key={index}
              {...cardProps}
              className={`card ${stat.link ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}
            >
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            </CardComponent>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/verify" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <UserCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Users</h3>
            <p className="text-gray-600">Approve pending doctor and hospital accounts</p>
          </div>
        </Link>

        <Link to="/admin/audit" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Activity className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">System Audit</h3>
            <p className="text-gray-600">View system activity and audit logs</p>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">System usage and performance metrics</p>
          </div>
        </Link>

        <Link to="/admin/settings" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Settings className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600">Configure system settings</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Users by Role</h2>
          </div>
          <div className="card-body">
            {statistics?.userCounts?.length > 0 ? (
              <div className="space-y-4">
                {statistics.userCounts.map((userType, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        userType._id === 'patient' ? 'bg-blue-500' :
                        userType._id === 'doctor' ? 'bg-green-500' :
                        userType._id === 'hospital' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {userType._id}s
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {userType.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No user data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Security Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Recent Security Alerts</h2>
          </div>
          <div className="card-body">
            {recentAlerts?.length > 0 ? (
              <div className="space-y-4">
                {recentAlerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{alert.description}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <span className={`badge ${
                      alert.severity === 'critical' ? 'badge-danger' :
                      alert.severity === 'high' ? 'badge-warning' :
                      'badge-gray'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No security alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent System Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent System Activity</h2>
        </div>
        <div className="card-body">
          {recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-gray-50">
                    <Activity className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <span className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <span>Action: {activity.action}</span>
                      {activity.actorId?.name && (
                        <span>By: {activity.actorId.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Blockchain Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Blockchain Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-800">
              <div>
                <p className="font-medium">Total Blocks: {statistics?.blockchainStats?.totalBlocks || 0}</p>
              </div>
              <div>
                <p className="font-medium">Chain Valid: {statistics?.blockchainStats?.isValid ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <p className="font-medium">Last Block: Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
