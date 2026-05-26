import { useState, useEffect } from 'react';
import { adminAuditLogsAPI } from '../api/admin';
import DataTable from '../components/DataTable';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLogs();
  }, [page, action]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminAuditLogsAPI.getLogs(page, 20, action || null);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('加载日志失败:', error);
      setError(error.response?.data?.detail || '加载日志失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'created_at',
      label: '时间',
      render: (val) => new Date(val).toLocaleString('zh-CN')
    },
    { key: 'admin_username', label: '管理员' },
    { key: 'action', label: '操作' },
    { key: 'target_type', label: '目标类型' },
    { key: 'target_id', label: '目标ID' },
    { key: 'details', label: '详情' },
    { key: 'ip_address', label: 'IP地址' },
  ];

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
          onClick={loadLogs}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">操作日志</h1>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部操作</option>
          <option value="login">登录</option>
          <option value="logout">登出</option>
          <option value="delete_user">删除用户</option>
          <option value="toggle_user">禁用/启用用户</option>
          <option value="delete_file">删除文件</option>
          <option value="update_config">更新配置</option>
        </select>
      </div>

      {logs.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无操作日志</h3>
          <p className="text-gray-500">管理员的操作记录将显示在这里</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
        />
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 条日志
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
