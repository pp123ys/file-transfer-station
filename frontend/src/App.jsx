import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import UserDetail from './admin/pages/UserDetail';
import Files from './admin/pages/Files';
import Settings from './admin/pages/Settings';
import AuditLogs from './admin/pages/AuditLogs';
import Announcements from './admin/pages/Announcements';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    </div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminPublicRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/login"
                element={
                  <AdminPublicRoute>
                    <AdminLogin />
                  </AdminPublicRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="users/:userId" element={<UserDetail />} />
                <Route path="files" element={<Files />} />
                <Route path="settings" element={<Settings />} />
                <Route path="audit-logs" element={<AuditLogs />} />
                <Route path="announcements" element={<Announcements />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
