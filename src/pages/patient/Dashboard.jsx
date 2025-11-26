import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  Users, 
  Shield, 
  Activity,
  Upload,
  UserCheck,
  TrendingUp,
  Calendar,
  AlertCircle,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/dashboard');
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Dashboard loading error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to load dashboard';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyPatientId = async () => {
    try {
      await navigator.clipboard.writeText(user._id);
      setCopied(true);
      toast.success('Patient ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy Patient ID');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Dashboard
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { statistics, recentActivity } = dashboardData || {};

  const statCards = [
    {
      title: 'Total Records',
      value: statistics?.totalRecords || 0,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      link: '/patient/records'
    },
    {
      title: 'Active Consents',
      value: statistics?.activeConsents || 0,
      icon: UserCheck,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      link: '/patient/consent'
    },
    {
      title: 'Pending Requests',
      value: statistics?.pendingRequests || 0,
      icon: Users,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      link: '/patient/consent'
    },
    {
      title: 'Audit Events',
      value: recentActivity?.length || 0,
      icon: Activity,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      link: '/patient/audit'
    }
  ];

  const quickActions = [
    {
      title: 'Upload New Record',
      description: 'Add a new medical record to your profile',
      icon: Upload,
      color: 'bg-blue-600 hover:bg-blue-700',
      link: '/patient/upload'
    },
    {
      title: 'Manage Consent',
      description: 'Control who can access your medical records',
      icon: Shield,
      color: 'bg-green-600 hover:bg-green-700',
      link: '/patient/consent'
    },
    {
      title: 'View Audit Trail',
      description: 'See who accessed your records and when',
      icon: Activity,
      color: 'bg-purple-600 hover:bg-purple-700',
      link: '/patient/audit'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Patient Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your secure health records portal
        </p>
      </div>

      {/* Patient ID Card */}
      {user && (
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Your Patient ID</h3>
                  <p className="text-sm text-blue-700">
                    Share this ID with healthcare providers for secure access
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
                  <code className="text-lg font-mono text-blue-900 font-semibold">
                    {user._id}
                  </code>
                </div>
                <button
                  onClick={copyPatientId}
                  className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy ID
                    </>
                  )}
                </button>
                <Link
                  to="/patient/profile"
                  className="btn btn-sm btn-secondary"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className={`btn ${action.color} text-white p-6 h-auto flex-col items-start space-y-3`}
                >
                  <Icon className="w-8 h-8" />
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">
                      {action.title}
                    </h3>
                    <p className="text-sm opacity-90">
                      {action.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Records by Category */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Records by Category
            </h2>
          </div>
          <div className="card-body">
            {statistics?.recordsByCategory?.length > 0 ? (
              <div className="space-y-3">
                {statistics.recordsByCategory.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {category._id.replace('-', ' ')}
                    </span>
                    <span className="badge badge-primary">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No records yet</p>
                <Link
                  to="/patient/upload"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Upload your first record
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="card-body">
            {recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <Link
                  to="/patient/audit"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View all activity →
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Your Data is Secure
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              All your medical records are encrypted and stored securely on our blockchain-powered system. 
              You have full control over who can access your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
