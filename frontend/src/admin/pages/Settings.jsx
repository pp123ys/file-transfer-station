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
