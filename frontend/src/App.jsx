import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboards
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { SponsorDashboard } from './pages/dashboards/SponsorDashboard';
import { InvestigatorDashboard } from './pages/dashboards/InvestigatorDashboard';
import { CoordinatorDashboard } from './pages/dashboards/CoordinatorDashboard';
import { DataManagerDashboard } from './pages/dashboards/DataManagerDashboard';
import { RegulatoryDashboard } from './pages/dashboards/RegulatoryDashboard';
import { ParticipantDashboard } from './pages/dashboards/ParticipantDashboard';

// Feature Modules
import { StudyListPage } from './pages/studies/StudyListPage';
import { ParticipantListPage } from './pages/participants/ParticipantListPage';
import { EcrfPage } from './pages/ecrf/EcrfPage';
import { QueryListPage } from './pages/queries/QueryListPage';
import { AdverseEventListPage } from './pages/adverse-events/AdverseEventListPage';
import { IpAccountabilityPage } from './pages/ip/IpAccountabilityPage';
import { DocumentListPage } from './pages/documents/DocumentListPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ProfilePage } from './pages/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { useAuth } from './context/AuthContext';

const IndexRedirect = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  switch (role) {
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    case 'SPONSOR': return <Navigate to="/sponsor/dashboard" replace />;
    case 'PRINCIPAL_INVESTIGATOR':
    case 'SUB_INVESTIGATOR': return <Navigate to="/investigator/dashboard" replace />;
    case 'SITE_COORDINATOR': return <Navigate to="/coordinator/dashboard" replace />;
    case 'DATA_MANAGER': return <Navigate to="/datamanager/dashboard" replace />;
    case 'REGULATORY_AFFAIRS': return <Navigate to="/regulatory/dashboard" replace />;
    case 'PARTICIPANT': return <Navigate to="/participant/dashboard" replace />;
    default: return <Navigate to="/profile" replace />;
  }
};

export const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Default Redirect to Role Dashboard on root path */}
              <Route index element={<IndexRedirect />} />

              {/* Role-Specific Dashboards */}
              <Route
                path="admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="sponsor/dashboard"
                element={
                  <RoleRoute allowedRoles={['SPONSOR']}>
                    <SponsorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="investigator/dashboard"
                element={
                  <RoleRoute allowedRoles={['PRINCIPAL_INVESTIGATOR', 'SUB_INVESTIGATOR']}>
                    <InvestigatorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="coordinator/dashboard"
                element={
                  <RoleRoute allowedRoles={['SITE_COORDINATOR']}>
                    <CoordinatorDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="datamanager/dashboard"
                element={
                  <RoleRoute allowedRoles={['DATA_MANAGER']}>
                    <DataManagerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="regulatory/dashboard"
                element={
                  <RoleRoute allowedRoles={['REGULATORY_AFFAIRS']}>
                    <RegulatoryDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="participant/dashboard"
                element={
                  <RoleRoute allowedRoles={['PARTICIPANT']}>
                    <ParticipantDashboard />
                  </RoleRoute>
                }
              />

              {/* Shared Feature Routes */}
              <Route path="studies" element={<StudyListPage />} />
              <Route path="participants" element={<ParticipantListPage />} />
              <Route path="ecrf" element={<EcrfPage />} />
              <Route path="queries" element={<QueryListPage />} />
              <Route path="adverse-events" element={<AdverseEventListPage />} />
              <Route path="ip" element={<IpAccountabilityPage />} />
              <Route path="documents" element={<DocumentListPage />} />

              {/* Admin Exclusive Utilities */}
              <Route
                path="admin/audit-logs"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AuditLogPage />
                  </RoleRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <UserManagementPage />
                  </RoleRoute>
                }
              />

              {/* Common User Profile & Unauthorized Pages */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
            </Route>

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
