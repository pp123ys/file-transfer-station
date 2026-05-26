import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUsersAPI } from '../api/admin';
import DataTable from '../components/DataTable';
import { formatBytes } from '../utils/format';

export default function UserDetail() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminUsersAPI.getUserDetail(userId);
      setData(data);
    } catch (error) {
      console.error('加载用户详情失败:', error);
      setError(error.response?.data?.detail || '加载用户详情失败，请稍后重试');
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
          onClick={loadUser}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/admin/users')}
          className="mb-6 text-blue-500 hover:text-blue-700"
        >
          ← 返回用户列表
        </button>
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">用户不存在</h3>
          <p className="text-gray-500">该用户可能已被删除</p>
        </div>
      </div>
    );
  }

  const fileColumns = [
    { key: 'name', label: '文件名' },
    {
      key: 'size',
      label: '大小',
      render: (val) => formatBytes(val)
    },
    {
      key: 'created_at',
      label: '上传时间',
      render: (val) => new Date(val).toLocaleString('zh-CN')
    },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/admin/users')}
        className="mb-6 text-blue-500 hover:text-blue-700"
      >
        ← 返回用户列表
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">用户详情</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">用户名</p>
            <p className="text-lg font-medium">{data.user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">邮箱</p>
            <p className="text-lg font-medium">{data.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">状态</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              data.user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {data.user.is_active ? '正常' : '禁用'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">注册时间</p>
            <p className="text-lg font-medium">
              {new Date(data.user.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">文件数</p>
            <p className="text-lg font-medium">{data.file_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">存储使用</p>
            <p className="text-lg font-medium">{formatBytes(data.storage_used)}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">用户文件</h2>
      {data.files && data.files.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
          <p className="text-gray-500">该用户尚未上传任何文件</p>
        </div>
      ) : (
        <DataTable
          columns={fileColumns}
          data={data.files || []}
        />
      )}
    </div>
  );
}
