import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, Users, User, Mail, Calendar, Phone } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';

const SearchPatients = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim() || searchQuery.length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('/hospital/search-patients', {
        params: { query: searchQuery.trim() }
      });

      setSearchResults(response.data.data.patients);
      setSearched(true);

      if (response.data.data.patients.length === 0) {
        toast('No patients found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to search patients';
      toast.error(errorMessage);
      setSearchResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Patients</h1>
        <p className="text-gray-600">Find patients to manage their records</p>
      </div>

      {/* Search Form */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by patient name or email..."
                  className="form-input pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  minLength={2}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {searched && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {searchResults.length} patient{searchResults.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" text="Searching patients..." />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No patients found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((patient) => (
                  <div key={patient._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {patient.name}
                          </h4>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {patient.email}
                            </div>
                            {patient.profileData?.dateOfBirth && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                DOB: {formatDate(patient.profileData.dateOfBirth)}
                              </div>
                            )}
                            {patient.profileData?.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                {patient.profileData.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            // Copy patient ID to clipboard for use in record storage
                            navigator.clipboard.writeText(patient._id);
                            toast.success('Patient ID copied to clipboard');
                          }}
                        >
                          Copy ID
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Users className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              How to use Search Patients
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Search for patients by their name or email address</li>
              <li>• Copy the patient ID to use when storing medical records</li>
              <li>• Only active patients will appear in search results</li>
              <li>• Use this feature to find patients before uploading their records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPatients;
