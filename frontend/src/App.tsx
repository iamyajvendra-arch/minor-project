import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ReportProblem } from './pages/ReportProblem';
import { MyComplaints } from './pages/MyComplaints';
import { ComplaintDetails } from './pages/ComplaintDetails';
import { CivicMapView } from './pages/CivicMapView';
import { AdminDashboard } from './pages/AdminDashboard';
import { RiskHeatmap } from './pages/RiskHeatmap';
import { DuplicateGroups } from './pages/DuplicateGroups';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeepAnalytics } from './pages/DeepAnalytics';
import { EscalationsPage } from './pages/EscalationsPage';
import { AdminComplaintsHub } from './pages/AdminComplaintsHub';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center text-xs text-[#64748B]">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex w-full min-h-screen bg-[#F4F6F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">{children}</div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/map"
        element={
          <div className="flex w-full min-h-screen bg-[#F4F6F9]">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
              <CivicMapView />
            </div>
          </div>
        }
      />

      {/* Citizen / Shared Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportProblem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-complaints"
        element={
          <ProtectedRoute>
            <MyComplaints />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <ProtectedRoute>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <DeepAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Specific Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminComplaintsHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/risk-heatmap"
        element={
          <ProtectedRoute allowedRoles={['admin', 'department']}>
            <RiskHeatmap />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/duplicates"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DuplicateGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/escalations"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EscalationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Department Specific Protected Routes */}
      <Route
        path="/department"
        element={
          <ProtectedRoute allowedRoles={['department', 'admin']}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/department/assigned"
        element={
          <ProtectedRoute allowedRoles={['department', 'admin']}>
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;
