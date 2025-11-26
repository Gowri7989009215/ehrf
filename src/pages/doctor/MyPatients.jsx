import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Users, 
  Eye, 
  Calendar, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const MyPatients = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/doctor/consents');
      setConsents(response.data.data.consents || []);
    } catch (error) {
      console.error('Failed to load consents:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load patients';
      toast.error(errorMessage);
      setConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, validUntil) => {
    const isExpired = new Date(validUntil) < new Date();
    
    if (status === 'granted' && !isExpired) {
      return <span className="badge badge-success">Active</span>;
    } else if (status === 'granted' && isExpired) {
      return <span className="badge badge-warning">Expired</span>;
    } else if (status === 'pending') {
      return <span className="badge badge-warning">Pending</span>;
    } else if (status === 'revoked') {
      return <span className="badge badge-danger">Revoked</span>;
    }
    return <span className="badge badge-gray">{status}</span>;
  };

  const getStatusIcon = (status, validUntil) => {
    const isExpired = new Date(validUntil) < new Date();
    
    if (status === 'granted' && !isExpired) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === 'pending') {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    } else if (status === 'revoked' || isExpired) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-500" />;
  };

  const handleViewRecords = (patient) => {
    // Navigate to view records page with patient pre-selected
    navigate('/doctor/records', { state: { selectedPatient: patient } });
  };

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.patientId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && consent.status === 'granted' && new Date(consent.validUntil) > new Date()) ||
                         (statusFilter === 'expired' && consent.status === 'granted' && new Date(consent.validUntil) < new Date()) ||
                         (statusFilter === consent.status);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading patients..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600">
            Manage patients who have granted you access to their medical records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {consents.filter(c => c.status === 'granted' && new Date(c.validUntil) > new Date()).length}
            </h3>
            <p className="text-sm text-gray-600">Active Consents</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {consents.filter(c => c.status === 'pending').length}
            </h3>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {consents.filter(c => c.status === 'granted' && new Date(c.validUntil) < new Date()).length}
            </h3>
            <p className="text-sm text-gray-600">Expired</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {consents.length}
            </h3>
            <p className="text-sm text-gray-600">Total Patients</p>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Patient List</h2>
        </div>
        <div className="card-body p-0">
          {filteredConsents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Valid Until</th>
                    <th>Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConsents.map((consent) => (
                    <tr key={consent._id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(consent.status, consent.validUntil)}
                          <div>
                            <p className="font-medium text-gray-900">
                              {consent.patientId?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {consent.patientId?._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm text-gray-900">
                            {consent.patientId?.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {consent.patientId?.profileData?.phone || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td>
                        {getStatusBadge(consent.status, consent.validUntil)}
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {format(new Date(consent.validUntil), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {consent.permissions?.canView && (
                            <span className="badge badge-primary text-xs">View</span>
                          )}
                          {consent.permissions?.canDownload && (
                            <span className="badge badge-primary text-xs">Download</span>
                          )}
                          {consent.permissions?.canUpdate && (
                            <span className="badge badge-primary text-xs">Update</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          {consent.status === 'granted' && new Date(consent.validUntil) > new Date() && (
                            <button
                              onClick={() => handleViewRecords(consent)}
                              className="btn btn-sm btn-primary"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Records
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No patients found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Patients will appear here when they grant you access to their records'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Patient Access Management</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Only patients who have granted you consent will appear here</li>
              <li>• Active consents allow you to view and manage patient records</li>
              <li>• Expired consents need to be renewed by requesting access again</li>
              <li>• All your interactions with patient data are logged and audited</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPatients;
