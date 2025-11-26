import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Database, Upload, FileText, Search } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const StoreRecords = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('file');
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();

  const searchPatients = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`/hospital/search-patients?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data.data.patients);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setValue('file', file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      formData.append('patientId', data.patientId);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('fileType', data.fileType);
      formData.append('category', data.category);
      formData.append('tags', data.tags || '');
      
      if (uploadType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (uploadType === 'text' && data.textData) {
        formData.append('textData', data.textData);
      }

      await axios.post('/hospital/store-record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Record stored successfully!');
      reset();
      setSelectedFile(null);
      setSearchResults([]);
      setSearchTerm('');
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to store record';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Patient Records</h1>
        <p className="text-gray-600">Store medical records for patients in the hospital system</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Select Patient</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="patientSearch" className="form-label">
                Search Patient *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="patientSearch"
                  type="text"
                  className="form-input pl-10"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchPatients(e.target.value);
                  }}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((patient) => (
                  <button
                    key={patient._id}
                    type="button"
                    onClick={() => {
                      setValue('patientId', patient._id);
                      setSearchTerm(`${patient.name} (${patient.email})`);
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-600">{patient.email}</p>
                  </button>
                ))}
              </div>
            )}

            <input
              type="hidden"
              {...register('patientId', {
                required: 'Please select a patient'
              })}
            />
            {errors.patientId && (
              <p className="form-error">{errors.patientId.message}</p>
            )}
          </div>
        </div>

        {/* Upload Type Selection */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Upload Method</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  uploadType === 'file'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <h3 className="font-medium text-gray-900">Upload File</h3>
                <p className="text-sm text-gray-600">PDF, images, documents</p>
              </button>
              
              <button
                type="button"
                onClick={() => setUploadType('text')}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  uploadType === 'text'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <h3 className="font-medium text-gray-900">Enter Text</h3>
                <p className="text-sm text-gray-600">Type or paste content</p>
              </button>
            </div>
          </div>
        </div>

        {/* Record Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label htmlFor="title" className="form-label">Record Title *</label>
              <input
                id="title"
                type="text"
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Lab Results, Discharge Summary"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                rows={3}
                className="form-input"
                placeholder="Optional description"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="form-label">Category *</label>
                <select
                  id="category"
                  className={`form-select ${errors.category ? 'border-red-500' : ''}`}
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select category</option>
                  <option value="general">General</option>
                  <option value="lab-results">Lab Results</option>
                  <option value="radiology">Radiology</option>
                  <option value="discharge-summary">Discharge Summary</option>
                  <option value="emergency">Emergency</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && <p className="form-error">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="fileType" className="form-label">File Type *</label>
                <select
                  id="fileType"
                  className={`form-select ${errors.fileType ? 'border-red-500' : ''}`}
                  {...register('fileType', { required: 'File type is required' })}
                >
                  <option value="">Select file type</option>
                  <option value="lab-report">Lab Report</option>
                  <option value="discharge-summary">Discharge Summary</option>
                  <option value="image">Medical Image</option>
                  <option value="pdf">PDF Document</option>
                  <option value="text">Text Document</option>
                  <option value="other">Other</option>
                </select>
                {errors.fileType && <p className="form-error">{errors.fileType.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="form-label">Tags</label>
              <input
                id="tags"
                type="text"
                className="form-input"
                placeholder="e.g., urgent, follow-up (comma-separated)"
                {...register('tags')}
              />
            </div>
          </div>
        </div>

        {/* File Upload or Text Input */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              {uploadType === 'file' ? 'Upload File' : 'Enter Content'}
            </h2>
          </div>
          <div className="card-body">
            {uploadType === 'file' ? (
              <div>
                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <label htmlFor="file" className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                      Choose a file
                    </label>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="textData" className="form-label">Record Content *</label>
                <textarea
                  id="textData"
                  rows={8}
                  className={`form-input ${errors.textData ? 'border-red-500' : ''}`}
                  placeholder="Enter medical record content..."
                  {...register('textData', {
                    required: uploadType === 'text' ? 'Content is required' : false
                  })}
                />
                {errors.textData && <p className="form-error">{errors.textData.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedFile(null);
              setSearchResults([]);
              setSearchTerm('');
            }}
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
                Storing...
              </div>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Store Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreRecords;
