import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersAPI } from '../api/admin';
import DataTable from '../components/DataTable';
import { formatBytes } from '../utils/format';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUsersAPI.getUsers(page, 20, search);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('加载用户失败:', error);
      setError(error.response?.data?.detail || '加载用户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      await adminUsersAPI.toggleUserActive(userId);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('确定要删除此用户吗？此操作不可恢复。')) {
      return;
    }

    try {
      await adminUsersAPI.deleteUser(userId);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || '删除失败');
    }
  };

  const columns = [
    { key: 'username', label: '用户名' },
    { key: 'email', label: '邮箱' },
    {
      key: 'file_count',
      label: '文件数',
      render: (val) => val || 0
    },
    {
      key: 'storage_quota_gb',
      label: '配额',
      render: (val) => val != null ? `${val} GB` : '默认',
    },
    {
      key: 'storage_used',
      label: '存储使用',
      render: (val) => formatBytes(val || 0)
    },
    {
      key: 'is_active',
      label: '状态',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {val ? '正常' : '禁用'}
        </span>
      )
    },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/admin/users/${row.id}`)}
        className="text-blue-500 hover:text-blue-700"
      >
        查看
      </button>
      <button
        onClick={() => handleToggle(row.id)}
        className="text-yellow-500 hover:text-yellow-700"
      >
        {row.is_active ? '禁用' : '启用'}
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-500 hover:text-red-700"
      >
        删除
      </button>
    </div>
  );

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
          onClick={loadUsers}
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
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {users.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无用户</h3>
          <p className="text-gray-500">当前系统中没有注册用户</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          actions={actions}
        />
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 个用户
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
            disabled={users.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
