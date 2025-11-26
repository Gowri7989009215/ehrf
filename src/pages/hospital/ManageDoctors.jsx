import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Stethoscope, UserPlus, UserMinus, Search } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctorId, setNewDoctorId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/hospital/doctors');
      setDoctors(response.data.data.doctors);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!newDoctorId.trim()) {
      toast.error('Please enter a doctor ID');
      return;
    }

    setIsAdding(true);
    try {
      await axios.post('/hospital/add-doctor', {
        doctorId: newDoctorId.trim()
      });
      
      toast.success('Doctor added successfully');
      setShowAddModal(false);
      setNewDoctorId('');
      fetchDoctors();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add doctor';
      toast.error(message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveDoctor = async (doctorId, doctorName) => {
    if (!confirm(`Are you sure you want to remove Dr. ${doctorName} from the hospital?`)) {
      return;
    }

    try {
      await axios.delete(`/hospital/doctor/${doctorId}`);
      toast.success(`Dr. ${doctorName} removed successfully`);
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to remove doctor');
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.profileData?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading doctors..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-600">Add and manage doctors associated with your hospital</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Doctor
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body">
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
      </div>

      {/* Doctors List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Hospital Doctors</h2>
        </div>
        <div className="card-body p-0">
          {filteredDoctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization</th>
                    <th>License Number</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor._id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                            <p className="text-sm text-gray-500">{doctor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {doctor.profileData?.specialization || 'General'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {doctor.profileData?.licenseNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${doctor.approved ? 'badge-success' : 'badge-warning'}`}>
                          {doctor.approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleRemoveDoctor(doctor._id, doctor.name)}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No doctors found' : 'No doctors added yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : 'Add doctors to start managing your hospital staff'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Doctor</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="doctorId" className="form-label">
                  Doctor ID *
                </label>
                <input
                  id="doctorId"
                  type="text"
                  className="form-input"
                  placeholder="Enter doctor's user ID"
                  value={newDoctorId}
                  onChange={(e) => setNewDoctorId(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  The doctor must already be registered in the system
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDoctorId('');
                }}
                className="btn btn-secondary"
                disabled={isAdding}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDoctor}
                disabled={isAdding}
                className="btn btn-primary"
              >
                {isAdding ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Adding...
                  </div>
                ) : (
                  'Add Doctor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
