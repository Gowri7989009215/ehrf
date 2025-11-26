import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, Calendar, Shield } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const RequestAccess = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      await axios.post('/doctor/request-access', {
        ...data,
        permissions: {
          canView: true,
          canDownload: data.canDownload || false,
          canUpdate: data.canUpdate || false,
          canShare: false
        },
        allowedCategories: data.consentType === 'limited-access' ? ['general'] : []
      });
      
      toast.success('Access request sent successfully!');
      reset();
    } catch (error) {
      console.error('Request access error:', error);
      const message = error.response?.data?.message || 
                     error.message || 
                     'Failed to send request';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request Patient Access</h1>
        <p className="text-gray-600">Request permission to access a patient's medical records</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="patientId" className="form-label">
                Patient ID *
              </label>
              <input
                id="patientId"
                type="text"
                className={`form-input ${errors.patientId ? 'border-red-500' : ''}`}
                placeholder="Enter patient ID"
                {...register('patientId', {
                  required: 'Patient ID is required'
                })}
              />
              {errors.patientId && (
                <p className="form-error">{errors.patientId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="requestMessage" className="form-label">
                Request Message
              </label>
              <textarea
                id="requestMessage"
                rows={4}
                className="form-input"
                placeholder="Explain why you need access to this patient's records..."
                {...register('requestMessage')}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Access Details</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="consentType" className="form-label">
                Access Type *
              </label>
              <select
                id="consentType"
                className={`form-select ${errors.consentType ? 'border-red-500' : ''}`}
                {...register('consentType', {
                  required: 'Access type is required'
                })}
              >
                <option value="">Select access type</option>
                <option value="limited-access">Limited Access</option>
                <option value="full-access">Full Access</option>
                <option value="emergency-only">Emergency Only</option>
              </select>
              {errors.consentType && (
                <p className="form-error">{errors.consentType.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="validUntil" className="form-label">
                Valid Until *
              </label>
              <input
                id="validUntil"
                type="date"
                className={`form-input ${errors.validUntil ? 'border-red-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
                {...register('validUntil', {
                  required: 'Expiry date is required'
                })}
              />
              {errors.validUntil && (
                <p className="form-error">{errors.validUntil.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="form-label">Requested Permissions</label>
              
              <div className="flex items-center">
                <input
                  id="canDownload"
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('canDownload')}
                />
                <label htmlFor="canDownload" className="ml-2 text-sm text-gray-700">
                  Download records
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="canUpdate"
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('canUpdate')}
                />
                <label htmlFor="canUpdate" className="ml-2 text-sm text-gray-700">
                  Add notes and updates
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Sending Request...
              </div>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </button>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Access Request Process</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Patient will receive your access request notification</li>
              <li>• They can approve, deny, or modify the requested permissions</li>
              <li>• All access is logged and tracked for security</li>
              <li>• Access automatically expires on the specified date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAccess;
