import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, Shield, Database, Mail, Key } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    systemName: 'EHR Blockchain System',
    adminEmail: 'admin@ehr-system.com',
    maintenanceMode: false,
    emailNotifications: true,
    auditRetentionDays: 365,
    maxFileSize: 10,
    jwtExpiryHours: 24,
    backupFrequency: 'daily'
  });

  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      systemName: 'EHR Blockchain System',
      adminEmail: 'admin@ehr-system.com',
      maintenanceMode: false,
      emailNotifications: true,
      auditRetentionDays: 365,
      maxFileSize: 10,
      jwtExpiryHours: 24,
      backupFrequency: 'daily'
    });
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="btn btn-outline"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <SettingsIcon className="w-5 h-5 mr-2" />
            General Settings
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                className="form-input"
                value={settings.systemName}
                onChange={(e) => handleSettingChange('systemName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </label>
              <input
                type="email"
                className="form-input"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Mode
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Enable maintenance mode (users cannot access the system)
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Notifications
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-600">
                  Send email notifications for important events
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security Settings
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JWT Token Expiry (hours)
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.jwtExpiryHours}
                onChange={(e) => handleSettingChange('jwtExpiryHours', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Log Retention (days)
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.auditRetentionDays}
                onChange={(e) => handleSettingChange('auditRetentionDays', parseInt(e.target.value))}
                min="30"
                max="3650"
              />
            </div>
          </div>
        </div>
      </div>

      {/* File & Storage Settings */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            File & Storage Settings
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum File Size (MB)
              </label>
              <input
                type="number"
                className="form-input"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup Frequency
              </label>
              <select
                className="form-input"
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">Database: ✅ Connected</p>
              </div>
              <div>
                <p className="font-medium">Blockchain: ✅ Valid</p>
              </div>
              <div>
                <p className="font-medium">Last Backup: Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Key className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">Important Notice</h3>
            <p className="text-sm text-yellow-800">
              Changes to security settings may affect system stability. Please ensure you understand
              the implications before saving. Some settings may require a system restart to take effect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
