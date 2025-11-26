import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import GrantConsentModal from '../../components/GrantConsentModal';
import { format } from 'date-fns';

const ManageConsent = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/consents');
      setConsents(response.data.data.consents || []);
    } catch (error) {
      console.error('Consent loading error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to load consents';
      toast.error(errorMessage);
      setConsents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to revoke consent for Dr. ${doctorName}?`)) {
      return;
    }

    try {
      await axios.post('/patient/revoke-consent', {
        doctorId,
        responseMessage: 'Consent revoked by patient'
      });
      
      toast.success(`Consent revoked for Dr. ${doctorName}`);
      fetchConsents();
    } catch (error) {
      console.error('Revoke consent error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to revoke consent';
      toast.error(errorMessage);
    }
  };

  const handleGrantConsent = async (consentData) => {
    try {
      await axios.post('/patient/grant-consent', consentData);
      toast.success('Consent granted successfully');
      setShowGrantModal(false);
      setSelectedDoctor(null);
      fetchConsents();
    } catch (error) {
      console.error('Grant consent error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to grant consent';
      toast.error(errorMessage);
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

  const filteredConsents = consents.filter(consent => {
    const matchesSearch = consent.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consent.doctorId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && consent.status === 'granted' && new Date(consent.validUntil) > new Date()) ||
                         (statusFilter === 'expired' && consent.status === 'granted' && new Date(consent.validUntil) < new Date()) ||
                         (statusFilter === consent.status);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading consents..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Consent
          </h1>
          <p className="text-gray-600">
            Control who can access your medical records
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
                  placeholder="Search doctors..."
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

      {/* Consents List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Doctor Access Permissions
          </h2>
        </div>
        <div className="card-body p-0">
          {filteredConsents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
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
                              Dr. {consent.doctorId?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {consent.doctorId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {consent.doctorId?.profileData?.specialization || 'General'}
                        </span>
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
                              onClick={() => handleRevokeConsent(consent.doctorId._id, consent.doctorId.name)}
                              className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Revoke
                            </button>
                          )}
                          {consent.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedDoctor(consent.doctorId);
                                  setShowGrantModal(true);
                                }}
                                className="btn btn-sm btn-success"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Grant
                              </button>
                              <button
                                onClick={() => handleRevokeConsent(consent.doctorId._id, consent.doctorId.name)}
                                className="btn btn-sm bg-gray-600 text-white hover:bg-gray-700"
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Deny
                              </button>
                            </>
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
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No consent requests found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Doctors will appear here when they request access to your records'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              How Consent Management Works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Doctors must request access to view your medical records</li>
              <li>• You can grant, deny, or revoke access at any time</li>
              <li>• All access is logged and tracked on the blockchain</li>
              <li>• Consents have expiration dates for added security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grant Consent Modal */}
      <GrantConsentModal
        isOpen={showGrantModal}
        onClose={() => {
          setShowGrantModal(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        onGrant={handleGrantConsent}
      />
    </div>
  );
};

export default ManageConsent;
