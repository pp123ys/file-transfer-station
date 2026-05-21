import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Home() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/files?parent_id=null');
      setFiles(response.data.files);
      setError('');
    } catch (err) {
      setError('加载文件列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onUploadClick={() => alert('上传功能待实现')} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-lg font-medium">欢迎使用 CloudFile</h1>
              <p className="mt-1 text-sm text-gray-600">
                当前用户: {user?.username}
              </p>
              
              {loading ? (
                <p className="mt-4">加载中...</p>
              ) : error ? (
                <p className="mt-4 text-red-600">{error}</p>
              ) : files.length === 0 ? (
                <p className="mt-4 text-gray-500">暂无文件，上传一些文件开始吧！</p>
              ) : (
                <p className="mt-4">文件数量: {files.length}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
