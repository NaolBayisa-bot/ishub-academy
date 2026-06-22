import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CategoryAdminDashboard from './pages/dashboard/CategoryAdminDashboard';
import TrainingFormPage from './pages/dashboard/TrainingFormPage';
import StudentTrainingListPage from './pages/dashboard/StudentTrainingListPage';
import StudentTrainingViewPage from './pages/dashboard/StudentTrainingViewPage';
import AdminResourcesPage from './pages/dashboard/AdminResourcesPage';
import StudentResourcesPage from './pages/dashboard/StudentResourcesPage';
import UnauthorizedPage from './pages/dashboard/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';
import { Role } from '@ishub/shared';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Student */}
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]} allowedStatuses={['PENDING']}>
              <PendingApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]} allowedStatuses={['ACTIVE']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[Role.MAIN_ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student Trainings */}
        <Route
          path="/trainings"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]} allowedStatuses={['ACTIVE']}>
              <StudentTrainingListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainings/:id"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]} allowedStatuses={['ACTIVE']}>
              <StudentTrainingViewPage />
            </ProtectedRoute>
          }
        />

        {/* Category Admin */}
        <Route
          path="/admin/trainings"
          element={
            <ProtectedRoute allowedRoles={[Role.CATEGORY_ADMIN]}>
              <CategoryAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainings/new"
          element={
            <ProtectedRoute allowedRoles={[Role.CATEGORY_ADMIN]}>
              <TrainingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainings/:id"
          element={
            <ProtectedRoute allowedRoles={[Role.CATEGORY_ADMIN]}>
              <TrainingFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <ProtectedRoute allowedRoles={[Role.CATEGORY_ADMIN]}>
              <AdminResourcesPage />
            </ProtectedRoute>
          }
        />

        {/* Student Resources */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]} allowedStatuses={['ACTIVE']}>
              <StudentResourcesPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
