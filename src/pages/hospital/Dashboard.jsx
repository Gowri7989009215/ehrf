import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Stethoscope, 
  FileText, 
  Users, 
  Activity,
  UserPlus,
  Database,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const HospitalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/hospital/dashboard');
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

  const { statistics } = dashboardData || {};

  const statCards = [
    {
      title: 'Total Doctors',
      value: statistics?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Approved Doctors',
      value: statistics?.approvedDoctors || 0,
      icon: UserPlus,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Total Records',
      value: statistics?.totalRecords || 0,
      icon: FileText,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Categories',
      value: statistics?.recordsByCategory?.length || 0,
      icon: Database,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
        <p className="text-gray-600">Manage doctors and patient records</p>
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
        <Link to="/hospital/doctors" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Doctors</h3>
            <p className="text-gray-600">Add and manage hospital doctors</p>
          </div>
        </Link>

        <Link to="/hospital/records" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Database className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Records</h3>
            <p className="text-gray-600">Store patient medical records</p>
          </div>
        </Link>

        <Link to="/hospital/search-patients" className="card hover:shadow-md transition-shadow">
          <div className="card-body text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Patients</h3>
            <p className="text-gray-600">Find and manage patient data</p>
          </div>
        </Link>
      </div>

      {/* Records by Category */}
      {statistics?.recordsByCategory?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Records by Category</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statistics.recordsByCategory.map((category, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                  <p className="text-sm text-gray-600 capitalize">
                    {category._id.replace('-', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
