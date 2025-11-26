import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FileText, 
  Eye, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Tag,
  Upload
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileViewer from '../../components/FileViewer';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordContent, setRecordContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/patient/records');
      setRecords(response.data.data.records || []);
    } catch (error) {
      console.error('Failed to load records:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load records';
      toast.error(errorMessage);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordContent = async (recordId) => {
    try {
      setContentLoading(true);
      const response = await axios.get(`/patient/record/${recordId}/content`);
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
      const response = await axios.get(`/patient/record/${record._id}/content`);
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

  const categories = [...new Set(records.map(record => record.category))];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || record.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading records..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
          <p className="text-gray-600">
            View and manage your uploaded medical records
          </p>
        </div>
        <Link
          to="/patient/upload"
          className="btn btn-primary"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload New Record
        </Link>
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
                  placeholder="Search records..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div key={record._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{record.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                  </div>
                  <span className="badge badge-primary text-xs ml-2">
                    {record.category}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(record.createdAt), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FileText className="w-4 h-4 mr-2" />
                    {record.fileType}
                  </div>
                  {record.tags && record.tags.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Tag className="w-4 h-4 mr-2" />
                      <div className="flex flex-wrap gap-1">
                        {record.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="badge badge-gray text-xs">
                            {tag}
                          </span>
                        ))}
                        {record.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{record.tags.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewRecord(record)}
                    className="btn btn-sm btn-primary flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadRecord(record)}
                    className="btn btn-sm btn-secondary"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || categoryFilter !== 'all' ? 'No records found' : 'No records yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first medical record to get started'
                }
              </p>
              <Link
                to="/patient/upload"
                className="btn btn-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Record
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* File Viewer */}
      <FileViewer
        isOpen={!!selectedRecord && !contentLoading}
        onClose={() => {
          setSelectedRecord(null);
          setRecordContent(null);
        }}
        record={recordContent}
        content={recordContent?.content}
        onDownload={() => handleDownloadRecord(selectedRecord)}
        canDownload={true} // Patients can always download their own records
      />

      {/* Loading overlay for content */}
      {contentLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <LoadingSpinner size="md" text="Loading record content..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRecords;
