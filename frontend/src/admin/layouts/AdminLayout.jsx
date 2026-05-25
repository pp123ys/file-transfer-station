import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
