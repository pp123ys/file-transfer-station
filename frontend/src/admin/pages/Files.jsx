import { useState, useEffect } from 'react';
import { adminFilesAPI } from '../api/admin';
import DataTable from '../components/DataTable';
import { formatBytes } from '../utils/format';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFiles();
  }, [page, search]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminFilesAPI.getFiles(page, 20, null, search);
      setFiles(data.files);
      setTotal(data.total);
    } catch (error) {
      console.error('加载文件失败:', error);
      setError(error.response?.data?.detail || '加载文件列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('确定要删除此文件吗？此操作不可恢复。')) {
      return;
    }

    try {
      await adminFilesAPI.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      alert(error.response?.data?.detail || '删除失败');
    }
  };

  const columns = [
    { key: 'name', label: '文件名' },
    { key: 'username', label: '所有者' },
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

  const actions = (row) => (
    <button
      onClick={() => handleDelete(row.id)}
      className="text-red-500 hover:text-red-700"
    >
      删除
    </button>
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
          onClick={loadFiles}
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
        <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
        <input
          type="text"
          placeholder="搜索文件..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {files.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件</h3>
          <p className="text-gray-500">当前系统中没有上传的文件</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={files}
          actions={actions}
        />
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 个文件
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
            disabled={files.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
