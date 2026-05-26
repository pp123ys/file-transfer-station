import { useState, useEffect } from 'react';
import { adminSettingsAPI } from '../api/admin';
import Toggle from '../components/Toggle';

export default function Settings() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminSettingsAPI.getSettings();
      setConfigs(data.configs);
    } catch (error) {
      console.error('加载设置失败:', error);
      setError(error.response?.data?.detail || '加载设置失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsAPI.updateSettings(configs);
      alert('设置已保存');
    } catch (error) {
      alert(error.response?.data?.detail || '保存失败');
    } finally {
      setSaving(false);
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
          onClick={loadSettings}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">系统设置</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            存储配额 (GB)
          </label>
          <input
            type="number"
            value={configs.storage_quota || 10}
            onChange={(e) => setConfigs({ ...configs, storage_quota: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            允许注册
          </label>
          <Toggle
            checked={configs.allow_register === 'true'}
            onChange={(e) => setConfigs({
              ...configs,
              allow_register: e.target.checked ? 'true' : 'false'
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            注册需要邮箱验证
          </label>
          <Toggle
            checked={configs.require_email !== 'false'}
            onChange={(e) => setConfigs({
              ...configs,
              require_email: e.target.checked ? 'true' : 'false'
            })}
          />
          <p className="text-sm text-gray-500 mt-1">
            关闭后用户注册时无需填写邮箱和验证码，仅需用户名和密码
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            最大文件大小 (MB)
          </label>
          <input
            type="number"
            value={configs.max_file_size || 100}
            onChange={(e) => setConfigs({ ...configs, max_file_size: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            允许的文件扩展名
          </label>
          <input
            type="text"
            value={configs.allowed_extensions || '*'}
            onChange={(e) => setConfigs({ ...configs, allowed_extensions: e.target.value })}
            placeholder="* 表示允许所有，或使用逗号分隔：.jpg,.png,.pdf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            使用 * 允许所有文件，或使用逗号分隔指定扩展名（如：.jpg,.png,.pdf）
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">邮件配置 (SMTP)</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP 服务器
              </label>
              <input
                type="text"
                value={configs.smtp_host || ''}
                onChange={(e) => setConfigs({ ...configs, smtp_host: e.target.value })}
                placeholder="smtp.example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP 端口
              </label>
              <input
                type="number"
                value={configs.smtp_port || 587}
                onChange={(e) => setConfigs({ ...configs, smtp_port: e.target.value })}
                placeholder="587"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP 用户名
              </label>
              <input
                type="text"
                value={configs.smtp_user || ''}
                onChange={(e) => setConfigs({ ...configs, smtp_user: e.target.value })}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP 密码
              </label>
              <input
                type="password"
                value={configs.smtp_password || ''}
                onChange={(e) => setConfigs({ ...configs, smtp_password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发件人邮箱
              </label>
              <input
                type="email"
                value={configs.smtp_from_email || ''}
                onChange={(e) => setConfigs({ ...configs, smtp_from_email: e.target.value })}
                placeholder="noreply@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                发件人名称
              </label>
              <input
                type="text"
                value={configs.smtp_from_name || ''}
                onChange={(e) => setConfigs({ ...configs, smtp_from_name: e.target.value })}
                placeholder="文件传输系统"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}