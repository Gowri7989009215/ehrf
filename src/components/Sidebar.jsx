import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard,
  Upload,
  FileText,
  Users,
  User,
  UserCheck,
  Activity,
  Shield,
  Building2,
  Stethoscope,
  UserPlus,
  Database,
  Settings,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: `/${user?.role}/dashboard`,
        icon: LayoutDashboard,
        roles: ['patient', 'doctor', 'hospital', 'admin']
      }
    ];

    const roleSpecificItems = {
      patient: [
        {
          name: 'Upload Records',
          href: '/patient/upload',
          icon: Upload,
          roles: ['patient']
        },
        {
          name: 'My Records',
          href: '/patient/records',
          icon: FileText,
          roles: ['patient']
        },
        {
          name: 'My Profile',
          href: '/patient/profile',
          icon: User,
          roles: ['patient']
        },
        {
          name: 'Manage Consent',
          href: '/patient/consent',
          icon: UserCheck,
          roles: ['patient']
        },
        {
          name: 'Audit Trail',
          href: '/patient/audit',
          icon: Activity,
          roles: ['patient']
        }
      ],
      doctor: [
        {
          name: 'Request Access',
          href: '/doctor/request-access',
          icon: UserPlus,
          roles: ['doctor']
        },
        {
          name: 'View Records',
          href: '/doctor/records',
          icon: FileText,
          roles: ['doctor']
        },
        {
          name: 'My Patients',
          href: '/doctor/patients',
          icon: Users,
          roles: ['doctor']
        },
        {
          name: 'Activity Log',
          href: '/doctor/activity',
          icon: Activity,
          roles: ['doctor']
        }
      ],
      hospital: [
        {
          name: 'Manage Doctors',
          href: '/hospital/doctors',
          icon: Stethoscope,
          roles: ['hospital']
        },
        {
          name: 'Store Records',
          href: '/hospital/records',
          icon: Database,
          roles: ['hospital']
        },
        {
          name: 'Search Patients',
          href: '/hospital/Search-patients',
          icon: Users,
          roles: ['hospital']
        }
      ],
      admin: [
        {
          name: 'Verify Users',
          href: '/admin/verify',
          icon: Shield,
          roles: ['admin']
        },
        {
          name: 'System Audit',
          href: '/admin/audit',
          icon: Activity,
          roles: ['admin']
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          roles: ['admin']
        },
        {
          name: 'Settings',
          href: '/admin/settings',
          icon: Settings,
          roles: ['admin']
        }
      ]
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role] || [])
    ];
  };

  const navigationItems = getNavigationItems();

  const getRoleInfo = () => {
    const roleInfo = {
      patient: {
        title: 'Patient Portal',
        description: 'Manage your health records',
        color: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-700'
      },
      doctor: {
        title: 'Doctor Portal',
        description: 'Access patient records',
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-700'
      },
      hospital: {
        title: 'Hospital Portal',
        description: 'Manage hospital operations',
        color: 'bg-purple-50 border-purple-200',
        textColor: 'text-purple-700'
      },
      admin: {
        title: 'Admin Portal',
        description: 'System administration',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-700'
      }
    };

    return roleInfo[user?.role] || roleInfo.patient;
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        {/* Role Info Card */}
        <div className={clsx(
          'rounded-lg border p-4 mb-6',
          roleInfo.color
        )}>
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              roleInfo.color.replace('50', '100')
            )}>
              {user?.role === 'patient' && <Users className="w-5 h-5 text-blue-600" />}
              {user?.role === 'doctor' && <Stethoscope className="w-5 h-5 text-green-600" />}
              {user?.role === 'hospital' && <Building2 className="w-5 h-5 text-purple-600" />}
              {user?.role === 'admin' && <Shield className="w-5 h-5 text-red-600" />}
            </div>
            <div>
              <h3 className={clsx('font-semibold text-sm', roleInfo.textColor)}>
                {roleInfo.title}
              </h3>
              <p className="text-xs text-gray-600">
                {roleInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'nav-link',
                  active && 'active'
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Quick Stats
          </h4>
          <div className="space-y-2">
            {user?.role === 'patient' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Records</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Consents</span>
                  <span className="font-medium">3</span>
                </div>
              </>
            )}
            
            {user?.role === 'doctor' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Patients</span>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Requests</span>
                  <span className="font-medium">5</span>
                </div>
              </>
            )}
            
            {user?.role === 'hospital' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Doctors</span>
                  <span className="font-medium">15</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Records Stored</span>
                  <span className="font-medium">342</span>
                </div>
              </>
            )}
            
            {user?.role === 'admin' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending Approvals</span>
                  <span className="font-medium">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-medium">156</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Blockchain Status */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Blockchain Active</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Last block: 2 min ago
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
