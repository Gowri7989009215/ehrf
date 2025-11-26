import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserCheck, 
  UserX, 
  Stethoscope, 
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const VerifyUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingUsers, setProcessingUsers] = useState(new Set());

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/pending-users');
      setPendingUsers(response.data.data.pendingUsers);
    } catch (error) {
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, userName, role) => {
    if (!confirm(`Are you sure you want to approve this ${role}?`)) {
      return;
    }

    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      await axios.post(`/admin/approve-user/${userId}`, {
        notes: `${role} approved by admin`
      });
      
      toast.success(`${userName} approved successfully`);
      fetchPendingUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve user';
      toast.error(message);
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRejectUser = async (userId, userName, role) => {
    const reason = prompt(`Please provide a reason for rejecting this ${role}:`);
    if (!reason) return;

    setProcessingUsers(prev => new Set(prev).add(userId));
    
    try {
      await axios.post(`/admin/reject-user/${userId}`, {
        reason
      });
      
      toast.success(`${userName} rejected successfully`);
      fetchPendingUsers();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject user';
      toast.error(message);
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'doctor':
        return <Stethoscope className="w-5 h-5 text-green-600" />;
      case 'hospital':
        return <Building2 className="w-5 h-5 text-purple-600" />;
      default:
        return <UserCheck className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      doctor: 'badge-success',
      hospital: 'badge-primary'
    };
    return `badge ${badges[role] || 'badge-gray'}`;
  };

  const filteredUsers = pendingUsers.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading pending users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Users</h1>
          <p className="text-gray-600">Review and approve pending doctor and hospital accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="doctor">Doctors</option>
            <option value="hospital">Hospitals</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.filter(u => u.role === 'doctor').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Hospitals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingUsers.filter(u => u.role === 'hospital').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Users List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Approvals ({filteredUsers.length})
          </h2>
        </div>
        <div className="card-body p-0">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Specialization/License</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={getRoleBadge(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <div className="text-sm text-gray-600">
                          {user.role === 'doctor' && (
                            <>
                              <p><strong>Specialization:</strong> {user.profileData?.specialization || 'General'}</p>
                              <p><strong>License:</strong> {user.profileData?.licenseNumber || 'N/A'}</p>
                            </>
                          )}
                          {user.role === 'hospital' && (
                            <>
                              <p><strong>License:</strong> {user.profileData?.licenseNumber || 'N/A'}</p>
                              <p><strong>Address:</strong> {user.profileData?.address || 'N/A'}</p>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveUser(user._id, user.name, user.role)}
                            disabled={processingUsers.has(user._id)}
                            className="btn btn-sm btn-success"
                          >
                            {processingUsers.has(user._id) ? (
                              <LoadingSpinner size="sm" color="white" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectUser(user._id, user.name, user.role)}
                            disabled={processingUsers.has(user._id)}
                            className="btn btn-sm btn-danger"
                          >
                            {processingUsers.has(user._id) ? (
                              <LoadingSpinner size="sm" color="white" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {roleFilter === 'all' ? 'No pending approvals' : `No pending ${roleFilter}s`}
              </h3>
              <p className="text-gray-600">
                {roleFilter === 'all' 
                  ? 'All user registrations have been processed'
                  : `No ${roleFilter} accounts are waiting for approval`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <UserCheck className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">User Verification Process</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Review user credentials and provided information carefully</li>
              <li>• Doctors and hospitals require manual approval for security</li>
              <li>• Approved users gain immediate access to the system</li>
              <li>• Rejected users are notified and their accounts are deactivated</li>
              <li>• All approval/rejection actions are logged on the blockchain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyUsers;
