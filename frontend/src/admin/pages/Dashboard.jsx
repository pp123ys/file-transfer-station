import { useState, useEffect } from 'react';
import { adminDashboardAPI } from '../api/admin';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { formatBytes } from '../utils/format';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminDashboardAPI.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('加载仪表盘失败:', error);
      setError(error.response?.data?.detail || '加载仪表盘失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          <p className="font-medium">错误</p>
          <p>{error}</p>
        </div>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  const logColumns = [
    { 
      key: 'created_at', 
      label: '时间', 
      render: (val) => new Date(val).toLocaleString('zh-CN') 
    },
    { key: 'admin_username', label: '管理员' },
    { key: 'action', label: '操作' },
    { key: 'details', label: '详情' },
    { key: 'ip_address', label: 'IP 地址' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总用户数"
          value={dashboard?.stats?.total_users || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="总文件数"
          value={dashboard?.stats?.total_files || 0}
          icon="📁"
          color="green"
        />
        <StatCard
          title="总存储"
          value={formatBytes(dashboard?.stats?.total_storage || 0)}
          icon="💾"
          color="yellow"
        />
        <StatCard
          title="今日活跃"
          value={dashboard?.stats?.active_users_today || 0}
          icon="📈"
          color="red"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">最近操作</h2>
      </div>

      {dashboard?.recent_logs && dashboard.recent_logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无操作记录</h3>
          <p className="text-gray-500">管理员的操作日志将显示在这里</p>
        </div>
      ) : (
        <DataTable
          columns={logColumns}
          data={dashboard?.recent_logs || []}
        />
      )}
    </div>
  );
}
