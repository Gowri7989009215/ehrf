import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Activity, 
  Shield, 
  Eye, 
  Download, 
  Upload, 
  UserCheck,
  Calendar,
  Filter,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { format } from 'date-fns';

const ActivityLog = () => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database'); // 'database' or 'blockchain'
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchActivityLog();
  }, []);

  const fetchActivityLog = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/doctor/activity-log');
      console.log('Activity log response:', response.data);
      setAuditData(response.data.data);
    } catch (error) {
      console.error('Failed to load activity log:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load activity log';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const filterAuditLogs = (logs) => {
    if (dateFilter === 'all') return logs;

    const now = new Date();
    const filterDate = new Date();

    switch (dateFilter) {
      case 'today':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return logs;
    }

    return logs.filter(log => new Date(log.timestamp) >= filterDate);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading audit trail..." />
      </div>
    );
  }

  const { auditLogs = [], blockchainAudit = [] } = auditData || {};

  console.log('Current audit data:', {
    auditData,
    auditLogsCount: auditLogs.length,
    blockchainCount: blockchainAudit.length,
    dateFilter
  });

  const filteredDatabaseLogs = filterAuditLogs(auditLogs);
  const filteredBlockchainLogs = filterAuditLogs(blockchainAudit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Audit Trail
        </h1>
        <p className="text-gray-600">
          Complete history of all activities related to your medical practice
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('database')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'database'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                System Logs
              </button>
              <button
                onClick={() => setActiveTab('blockchain')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'blockchain'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Blockchain
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                className="form-select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Content */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            {activeTab === 'database' ? 'System Activity Logs' : 'Blockchain Records'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {activeTab === 'database' 
              ? 'Detailed system logs of all activities'
              : 'Immutable blockchain records for critical actions'
            }
          </p>
        </div>
        <div className="card-body p-0">
          {activeTab === 'database' ? (
            <DatabaseAuditView logs={filteredDatabaseLogs} />
          ) : (
            <BlockchainAuditView logs={filteredBlockchainLogs} />
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              Audit Trail Security
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• All activities are automatically logged and cannot be modified</li>
              <li>• Critical actions are recorded on the blockchain for immutability</li>
              <li>• Patient record access is tracked for compliance and security</li>
              <li>• Audit logs help ensure regulatory compliance and detect unauthorized access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const DatabaseAuditView = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No audit logs found
        </h3>
        <p className="text-gray-600">
          Activities will appear here as they occur
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {logs.map((log, index) => (
        <div key={index} className="p-6 hover:bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
              {getActionIcon(log.action)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {log.description}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={getSeverityBadge(log.severity)}>
                    {log.severity}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                <span>Action: {log.action}</span>
                {log.actorId?.name && (
                  <span>By: {log.actorId.name}</span>
                )}
                {log.metadata?.ipAddress && (
                  <span>IP: {log.metadata.ipAddress}</span>
                )}
              </div>
              {log.blockchainHash && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Blockchain: {log.blockchainHash.substring(0, 16)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const BlockchainAuditView = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No blockchain records found
        </h3>
        <p className="text-gray-600">
          Blockchain records will appear here for critical actions
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {logs.map((record, index) => (
        <div key={index} className="p-6 hover:bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  Block #{record.blockIndex}
                </h4>
                <span className="text-xs text-gray-500">
                  {format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                <p><strong>Type:</strong> {record.data?.type}</p>
                <p><strong>Action:</strong> {record.data?.action}</p>
                {record.data?.recordId && (
                  <p><strong>Record ID:</strong> {record.data.recordId}</p>
                )}
              </div>
              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                <span>Hash: {record.hash}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions
const getActionIcon = (action) => {
  const iconMap = {
    'RECORD_VIEW': Eye,
    'RECORD_DOWNLOAD': Download,
    'CONSENT_REQUEST': UserCheck,
    'LOGIN': Activity,
    'LOGOUT': Activity,
    'default': Activity
  };

  const IconComponent = iconMap[action] || iconMap.default;
  return <IconComponent className="w-4 h-4" />;
};

const getActionColor = (action) => {
  const colorMap = {
    'RECORD_VIEW': 'text-green-600 bg-green-50',
    'RECORD_DOWNLOAD': 'text-purple-600 bg-purple-50',
    'CONSENT_REQUEST': 'text-blue-600 bg-blue-50',
    'LOGIN': 'text-gray-600 bg-gray-50',
    'LOGOUT': 'text-gray-600 bg-gray-50',
    'default': 'text-gray-600 bg-gray-50'
  };

  return colorMap[action] || colorMap.default;
};

const getSeverityBadge = (severity) => {
  const badgeMap = {
    'low': 'badge-gray',
    'medium': 'badge-warning',
    'high': 'badge-danger',
    'critical': 'badge-danger'
  };

  return `badge ${badgeMap[severity] || 'badge-gray'}`;
};

export default ActivityLog;
