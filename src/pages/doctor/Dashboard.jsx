import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, 
  FileText, 
  Clock, 
  Activity,
  UserPlus,
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/doctor/dashboard');
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

  const { statistics, patientsWithConsent } = dashboardData || {};

  const statCards = [
    {
      title: 'Active Consents',
      value: statistics?.activeConsents || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Pending Requests',
      value: statistics?.pendingRequests || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Expiring Soon',
      value: statistics?.expiringSoon || 0,
      icon: Calendar,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Total Patients',
      value: statistics?.totalPatients || 0,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600">Manage patient access and view medical records</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
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
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/doctor/request-access" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <UserPlus className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Access</h3>
            <p className="text-gray-600">Request access to patient records</p>
          </div>
        </Link>

        <Link to="/doctor/records" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Eye className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Records</h3>
            <p className="text-gray-600">Access patient medical records</p>
          </div>
        </Link>

        <Link to="/doctor/activity" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Activity className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Log</h3>
            <p className="text-gray-600">View your access history</p>
          </div>
        </Link>
      </div>

      {/* Patients with Active Consent */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Patients with Active Consent</h2>
        </div>
        <div className="card-body">
          {patientsWithConsent?.length > 0 ? (
            <div className="space-y-4">
              {patientsWithConsent.map((consent, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{consent.patientId?.name}</h4>
                    <p className="text-sm text-gray-600">{consent.patientId?.email}</p>
                  </div>
                  <Link
                    to={`/doctor/records/${consent.patientId?._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Records
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active patient consents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
