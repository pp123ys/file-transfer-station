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

  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const [quotaGb, setQuotaGb] = useState("");
  const [quotaMsg, setQuotaMsg] = useState({ type: "", text: "" });
  const [savingQuota, setSavingQuota] = useState(false);
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

    const handleChangePassword = async () => {
    setPasswordMsg({ type: "", text: "" });
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "密码至少6位" });
      return;
    }

    setChangingPassword(true);
    try {
      await adminUsersAPI.changeUserPassword(userId, newPassword);
      setPasswordMsg({ type: "success", text: "密码修改成功" });
      setNewPassword("");
    } catch (err) {
      setPasswordMsg({ type: "error", text: err.response?.data?.detail || "修改失败" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveQuota = async () => {
    setQuotaMsg({ type: "", text: "" });
    const val = quotaGb.trim();
    let quotaValue = null;
    if (val !== "") {
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) {
        setQuotaMsg({ type: "error", text: "请输入有效的正整数" });
        return;
      }
      quotaValue = num;
    }

    setSavingQuota(true);
    try {
      await adminUsersAPI.setUserQuota(userId, quotaValue);
      setQuotaMsg({ type: "success", text: "配额设置成功" });
      loadUser();
    } catch (err) {
      setQuotaMsg({ type: "error", text: err.response?.data?.detail || "设置失败" });
    } finally {
      setSavingQuota(false);
    }
  };

  const handleResetQuota = async () => {
    setSavingQuota(true);
    try {
      await adminUsersAPI.setUserQuota(userId, null);
      setQuotaMsg({ type: "success", text: "已重置为全局默认配额" });
      setQuotaGb("");
      loadUser();
    } catch (err) {
      setQuotaMsg({ type: "error", text: err.response?.data?.detail || "重置失败" });
    } finally {
      setSavingQuota(false);
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

            {/* 密码管理 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">密码管理</h2>

        {passwordMsg.text && (
          <div className={`mb-4 px-4 py-3 rounded ${
            passwordMsg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {passwordMsg.text}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少6位"
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="px-4 py-2 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {changingPassword ? "修改中..." : "修改密码"}
          </button>
        </div>
      </div>

      {/* 存储配额 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">存储配额</h2>

        {quotaMsg.text && (
          <div className={`mb-4 px-4 py-3 rounded ${
            quotaMsg.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {quotaMsg.text}
          </div>
        )}

        <div className="text-sm text-gray-600 mb-3">
          当前配额：
          {data.storage_quota_gb != null
            ? <span className="font-semibold">{data.storage_quota_gb} GB（个人）</span>
            : <span>全局默认</span>
          }
          {" | "}已使用：{formatBytes(data.storage_used)}
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新配额 (GB) - 留空使用全局默认
            </label>
            <input
              type="number"
              min="1"
              value={quotaGb}
              onChange={(e) => setQuotaGb(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={data.storage_quota_gb != null ? String(data.storage_quota_gb) : "使用全局默认"}
            />
          </div>
          <button
            onClick={handleSaveQuota}
            disabled={savingQuota}
            className="px-4 py-2 h-10 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            {savingQuota ? "保存中..." : "保存"}
          </button>
          <button
            onClick={handleResetQuota}
            disabled={savingQuota}
            className="px-4 py-2 h-10 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap"
          >
            重置为默认
          </button>
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
