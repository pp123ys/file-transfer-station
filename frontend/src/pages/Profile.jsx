import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';

export default function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // 这里可以添加更新用户信息的API调用
      // await authAPI.updateProfile({ email });
      setMessage({ type: 'success', text: '保存成功' });
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('确定要退出登录吗？')) {
      await logout();
      window.location.href = '/login';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-bold text-gray-900">个人设置</h1>
          </div>

          {/* 消息提示 */}
          {message.text && (
            <div className={`mx-6 mt-4 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          <div className="p-6">
            {/* 用户头像 */}
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">普通用户</p>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
                  {user?.username}
                </div>
                <p className="mt-1 text-sm text-gray-500">用户名无法修改</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入邮箱"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
                    {user?.email || '未设置'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  注册时间
                </label>
                <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
                  {formatDate(user?.created_at)}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                退出登录
              </button>

              {editing ? (
                <div className="space-x-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  编辑资料
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 存储信息 */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">存储空间</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">已使用</span>
              <span className="font-medium">0 MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 MB</span>
              <span>可用 100 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
