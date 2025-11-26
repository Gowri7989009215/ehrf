import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, FileText, Download, Calendar, Search } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileViewer from '../../components/FileViewer';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const ViewRecords = () => {
  const [consents, setConsents] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordContent, setRecordContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchActiveConsents();
  }, []);

  useEffect(() => {
    // Check if patient was pre-selected from navigation state
    if (location.state?.selectedPatient) {
      setSelectedPatient(location.state.selectedPatient);
      fetchPatientRecords(location.state.selectedPatient.patientId._id);
    }
  }, [location.state]);

  const fetchActiveConsents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/doctor/consents');
      setConsents(response.data.data.consents);
    } catch (error) {
      console.error('Failed to load consents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientRecords = async (patientId) => {
    try {
      setRecordsLoading(true);
      const response = await axios.get(`/doctor/records/${patientId}`);
      setRecords(response.data.data.records);
    } catch (error) {
      console.error('Failed to load records:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load patient records';
      toast.error(errorMessage);
      setRecords([]);
    } finally {
      setRecordsLoading(false);
    }
  };

  const fetchRecordContent = async (recordId) => {
    try {
      setContentLoading(true);
      const response = await axios.get(`/doctor/record/${recordId}/content`);
      setRecordContent(response.data.data.record);
    } catch (error) {
      console.error('Failed to load record content:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load record content';
      toast.error(errorMessage);
    } finally {
      setContentLoading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    fetchRecordContent(record._id);
  };

  const handleDownloadRecord = async (record) => {
    try {
      const response = await axios.get(`/doctor/record/${record._id}/content`);
      const recordData = response.data.data.record;
      
      // Handle different file types for download
      if (recordData.metadata?.mimeType && recordData.metadata.mimeType !== 'text/plain') {
        // For binary files (images, PDFs, etc.), create blob from base64
        const byteCharacters = atob(recordData.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: recordData.metadata.mimeType });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = recordData.metadata.originalFileName || `${recordData.title.replace(/[^a-z0-9]/gi, '_')}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // For text files, create text content
        const content = `
Medical Record: ${recordData.title}
Description: ${recordData.description}
Category: ${recordData.category}
Date: ${format(new Date(recordData.createdAt), 'PPP')}

Content:
${recordData.content}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordData.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success('Record downloaded successfully');
    } catch (error) {
      console.error('Failed to download record:', error);
      const errorMessage = error.response?.data?.message || 'Failed to download record';
      toast.error(errorMessage);
    }
  };

  const handlePatientSelect = (consent) => {
    setSelectedPatient(consent);
    fetchPatientRecords(consent.patientId._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading consents..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">View Patient Records</h1>
        <p className="text-gray-600">Access medical records for patients who have granted consent</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Patients with Active Consent</h2>
          </div>
          <div className="card-body p-0">
            {consents.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {consents.map((consent) => (
                  <button
                    key={consent._id}
                    onClick={() => handlePatientSelect(consent)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedPatient?._id === consent._id ? 'bg-primary-50 border-r-4 border-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {consent.patientId?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {consent.patientId?.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Valid until: {format(new Date(consent.validUntil), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active consents</p>
              </div>
            )}
          </div>
        </div>

        {/* Records List */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">
                  Medical Records - {selectedPatient.patientId?.name}
                </h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="badge badge-success">Active Consent</span>
                  <span className="text-sm text-gray-600">
                    Expires: {format(new Date(selectedPatient.validUntil), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <div className="card-body">
                {recordsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" text="Loading records..." />
                  </div>
                ) : records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{record.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Category: {record.category}</span>
                              <span>Type: {record.fileType}</span>
                              <span>{format(new Date(record.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                            {record.tags && record.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {record.tags.map((tag, index) => (
                                  <span key={index} className="badge badge-gray text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button 
                              onClick={() => handleViewRecord(record)}
                              className="btn btn-sm btn-primary"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            {selectedPatient.permissions?.canDownload && (
                              <button 
                                onClick={() => handleDownloadRecord(record)}
                                className="btn btn-sm btn-secondary"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No medical records found</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a Patient
                </h3>
                <p className="text-gray-600">
                  Choose a patient from the list to view their medical records
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Viewer */}
      <FileViewer
        isOpen={!!selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          setRecordContent(null);
        }}
        record={recordContent}
        content={recordContent?.content}
        onDownload={() => handleDownloadRecord(selectedRecord)}
        canDownload={selectedPatient?.permissions?.canDownload}
      />
    </div>
  );
};

export default ViewRecords;
