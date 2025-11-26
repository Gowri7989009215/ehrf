import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Shield, CheckCircle } from 'lucide-react';

const GrantConsentModal = ({ isOpen, onClose, doctor, onGrant }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      consentType: 'limited-access',
      canView: true,
      canDownload: false,
      canUpdate: false,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      allowedCategories: [],
      responseMessage: ''
    }
  });

  const consentType = watch('consentType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const consentData = {
        doctorId: doctor._id,
        consentType: data.consentType,
        permissions: {
          canView: data.canView,
          canDownload: data.canDownload || false,
          canUpdate: data.canUpdate || false,
          canShare: false
        },
        allowedCategories: data.consentType === 'limited-access' ? data.allowedCategories : [],
        validUntil: data.validUntil,
        responseMessage: data.responseMessage || ''
      };

      await onGrant(consentData);
      reset();
      onClose();
    } catch (error) {
      console.error('Grant consent error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Grant Access Permission</h2>
            <p className="text-sm text-gray-600 mt-1">
              Grant Dr. {doctor.name} access to your medical records
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Doctor Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900">Doctor Information</h3>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Name:</strong> Dr. {doctor.name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {doctor.email}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Specialization:</strong> {doctor.profileData?.specialization || 'General'}
                </p>
              </div>
            </div>
          </div>

          {/* Access Type */}
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
              <option value="limited-access">Limited Access</option>
              <option value="full-access">Full Access</option>
              <option value="emergency-only">Emergency Only</option>
            </select>
            {errors.consentType && (
              <p className="form-error">{errors.consentType.message}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">
              {consentType === 'limited-access' && 'Doctor can access only general medical records'}
              {consentType === 'full-access' && 'Doctor can access all your medical records'}
              {consentType === 'emergency-only' && 'Doctor can access records only in emergency situations'}
            </p>
          </div>

          {/* Valid Until */}
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

          {/* Permissions */}
          <div>
            <label className="form-label">Permissions</label>
            <div className="space-y-3 mt-2">
              <div className="flex items-center">
                <input
                  id="canView"
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  {...register('canView')}
                  disabled={true} // Always required
                />
                <label htmlFor="canView" className="ml-2 text-sm text-gray-700">
                  View records (required)
                </label>
              </div>
              
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

          {/* Limited Access Categories */}
          {consentType === 'limited-access' && (
            <div>
              <label className="form-label">Allowed Categories</label>
              <div className="space-y-2 mt-2">
                {['general', 'cardiology', 'neurology', 'orthopedics', 'dermatology', 'psychiatry'].map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      type="checkbox"
                      value={category}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      {...register('allowedCategories')}
                    />
                    <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700 capitalize">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Select which categories of records the doctor can access
              </p>
            </div>
          )}

          {/* Response Message */}
          <div>
            <label htmlFor="responseMessage" className="form-label">
              Message (Optional)
            </label>
            <textarea
              id="responseMessage"
              rows={3}
              className="form-input"
              placeholder="Add a message for the doctor..."
              {...register('responseMessage')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-success"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Granting...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Grant Access
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrantConsentModal;
