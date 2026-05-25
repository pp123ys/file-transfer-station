import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { adminDashboardAPI } from '../api/admin';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardAPI.getDashboard(20);
      setDashboardData(data);
    } catch (err) {
      console.error('加载仪表盘数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
  };

  const logColumns = [
    { key: 'action', label: '操作类型' },
    { key: 'target_type', label: '目标类型' },
    { key: 'target_id', label: '目标ID' },
    { key: 'username', label: '用户' },
    { key: 'ip_address', label: 'IP地址' },
    { key: 'created_at', label: '时间', render: (value) => formatDate(value) },
  ];

  const getStatIcon = (type) => {
    switch (type) {
      case 'users':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'files':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'storage':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'active':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="用户总数"
          value={dashboardData?.total_users || 0}
          icon={getStatIcon('users')}
          color="blue"
        />
        <StatCard
          title="文件总数"
          value={dashboardData?.total_files || 0}
          icon={getStatIcon('files')}
          color="green"
        />
        <StatCard
          title="总存储"
          value={dashboardData?.total_storage ? formatBytes(dashboardData.total_storage) : '0 B'}
          icon={getStatIcon('storage')}
          color="yellow"
        />
        <StatCard
          title="今日活跃"
          value={dashboardData?.today_active || 0}
          icon={getStatIcon('active')}
          color="red"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近操作日志</h2>
        {dashboardData?.recent_logs && dashboardData.recent_logs.length > 0 ? (
          <DataTable
            columns={logColumns}
            data={dashboardData.recent_logs}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            暂无操作日志
          </div>
        )}
      </div>
    </div>
  );
}
