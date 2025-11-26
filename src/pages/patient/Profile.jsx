import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Copy,
  Check,
  CreditCard
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/profile');
      const profile = response.data.data.profile;
      setProfileData(profile);
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.profileData?.phone || '',
        dateOfBirth: profile.profileData?.dateOfBirth ?
          new Date(profile.profileData.dateOfBirth).toISOString().split('T')[0] : '',
        address: profile.profileData?.address || '',
        emergencyContactName: profile.profileData?.emergencyContact?.name || '',
        emergencyContactPhone: profile.profileData?.emergencyContact?.phone || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.put('/patient/profile', {
        name: formData.name,
        profileData: {
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone
          }
        }
      });
      
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.profileData?.phone || '',
        dateOfBirth: profileData.profileData?.dateOfBirth ?
          new Date(profileData.profileData.dateOfBirth).toISOString().split('T')[0] : '',
        address: profileData.profileData?.address || '',
        emergencyContactName: profileData.profileData?.emergencyContact?.name || '',
        emergencyContactPhone: profileData.profileData?.emergencyContact?.phone || ''
      });
    }
  };

  const copyPatientId = async () => {
    try {
      await navigator.clipboard.writeText(profileData._id);
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
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Profile Not Found
        </h3>
        <p className="text-gray-600">
          Unable to load your profile information
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Patient ID Card */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Patient ID</h3>
                <p className="text-sm text-blue-700">
                  Use this ID when communicating with healthcare providers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
                <code className="text-lg font-mono text-blue-900 font-semibold">
                  {profileData._id}
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
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Full Name</label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{profileData.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{profileData.email}</span>
                <span className="badge badge-success text-xs">Verified</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              {editing ? (
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {profileData.profileData?.phone || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {profileData.profileData?.dateOfBirth ? 
                      format(new Date(profileData.profileData.dateOfBirth), 'PPP') : 
                      'Not provided'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="form-label">Address</label>
              {editing ? (
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter your address"
                />
              ) : (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">
                    {profileData.profileData?.address || 'Not provided'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Emergency Contact</label>
              {editing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                    placeholder="Contact name"
                  />
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                    placeholder="Contact phone number"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">
                    {profileData.profileData?.emergencyContact?.name && profileData.profileData?.emergencyContact?.phone
                      ? `${profileData.profileData.emergencyContact.name} (${profileData.profileData.emergencyContact.phone})`
                      : 'Not provided'
                    }
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Account Status</label>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="badge badge-success">
                  {profileData.isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
            </div>

            <div>
              <label className="form-label">Member Since</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">
                  {format(new Date(profileData.createdAt), 'PPP')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Security & Privacy</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Your Patient ID is unique and should be kept secure</li>
              <li>• Share your Patient ID only with authorized healthcare providers</li>
              <li>• All your medical records are encrypted and stored securely</li>
              <li>• You have full control over who can access your data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
