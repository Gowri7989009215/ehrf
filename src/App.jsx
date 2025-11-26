import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import UploadRecord from './pages/patient/UploadRecord';
import PatientViewRecords from './pages/patient/ViewRecords';
import PatientProfile from './pages/patient/Profile';
import ManageConsent from './pages/patient/ManageConsent';
import AuditTrail from './pages/patient/AuditTrail';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import RequestAccess from './pages/doctor/RequestAccess';
import ViewRecords from './pages/doctor/ViewRecords';
import MyPatients from './pages/doctor/MyPatients';
import DoctorActivityLog from './pages/doctor/ActivityLog';

// Hospital Pages
import HospitalDashboard from './pages/hospital/Dashboard';
import ManageDoctors from './pages/hospital/ManageDoctors';
import StoreRecords from './pages/hospital/StoreRecords';
import SearchPatients from './pages/hospital/SearchPatients';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import VerifyUsers from './pages/admin/VerifyUsers';
import SystemAudit from './pages/admin/SystemAudit';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';

function App() {
  const { isAuthenticated, isLoading, user, needsApproval } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, show auth routes
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // If user needs approval, show pending approval message
  if (needsApproval) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-md w-full mx-4">
            <div className="card text-center">
              <div className="card-body">
                <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Account Pending Approval
                </h2>
                <p className="text-gray-600 mb-4">
                  Your {user?.role} account is currently under review by our administrators. 
                  You will receive access once your account is approved.
                </p>
                <p className="text-sm text-gray-500">
                  This process typically takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main application layout
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 ml-64 p-6">
          <Routes>
            {/* Default redirect based on user role */}
            <Route 
              path="/" 
              element={
                <Navigate 
                  to={`/${user?.role}/dashboard`} 
                  replace 
                />
              } 
            />

            {/* Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/upload" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <UploadRecord />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/records" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientViewRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/profile" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <PatientProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/consent" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <ManageConsent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient/audit" 
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <AuditTrail />
                </ProtectedRoute>
              } 
            />

            {/* Doctor Routes */}
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/request-access" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <RequestAccess />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/records" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <ViewRecords />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/patients" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <MyPatients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor/activity" 
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <DoctorActivityLog />
                </ProtectedRoute>
              } 
            />

            {/* Hospital Routes */}
            <Route 
              path="/hospital/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <HospitalDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/hospital/doctors" 
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <ManageDoctors />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/hospital/records"
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <StoreRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospital/search-patients"
              element={
                <ProtectedRoute allowedRoles={['hospital']}>
                  <SearchPatients />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/admin/verify"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <VerifyUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemAudit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route 
              path="*" 
              element={
                <div className="text-center py-12">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
