import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import { filesAPI } from '../api/files';
import { completeEmail, sendVerificationCode } from '../api/email';

export default function Profile() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [storage, setStorage] = useState(null);

  const [emailStep, setEmailStep] = useState(user?.email ? 'done' : 'input');
  const [verificationCode, setVerificationCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadStorage();
  }, []);

  const loadStorage = async () => {
    try {
      const data = await filesAPI.getStorageInfo();
      setStorage(data);
    } catch (err) {
      console.error('加载存储空间失败:', err);
    }
  };

  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    setEmailSuccess('');
    
    try {
      await sendVerificationCode(email);
      setEmailStep('verify');
      setEmailSuccess('验证码已发送');
    } catch (err) {
      setEmailError(err.response?.data?.detail || '发送失败');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailError('');
    
    try {
      await completeEmail(email, verificationCode);
      setEmailSuccess('邮箱补全成功');
      setEmailStep('done');
      window.location.reload();
    } catch (err) {
      setEmailError(err.response?.data?.detail || '验证失败');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResendCode = async () => {
    setEmailLoading(true);
    setEmailError('');
    
    try {
      await sendVerificationCode(email);
      setEmailSuccess('验证码已重新发送');
    } catch (err) {
      setEmailError(err.response?.data?.detail || '发送失败');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: '新密码至少6位' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: '两次输入的密码不一致' });
      return;
    }

    setChangingPassword(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setPasswordMsg({ type: 'success', text: '密码修改成功' });
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || '修改失败' });
    } finally {
      setChangingPassword(false);
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
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{user?.username}</h2>
                <p className="text-sm text-gray-500">普通用户</p>
              </div>
            </div>

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
                {emailStep === 'done' ? (
                  <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
                    {user?.email || '未设置'}
                  </div>
                ) : emailStep === 'input' ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请输入邮箱"
                    />
                    {emailError && (
                      <div className="text-sm text-red-600">{emailError}</div>
                    )}
                    {emailSuccess && emailStep === 'input' && (
                      <div className="text-sm text-green-600">{emailSuccess}</div>
                    )}
                    <button
                      onClick={handleSendCode}
                      disabled={emailLoading || !email}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {emailLoading ? '发送中...' : '发送验证码'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      验证码已发送至：{email}
                    </p>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="请输入验证码"
                      maxLength={6}
                    />
                    {emailError && (
                      <div className="text-sm text-red-600">{emailError}</div>
                    )}
                    {emailSuccess && emailStep === 'verify' && (
                      <div className="text-sm text-green-600">{emailSuccess}</div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEmailStep('input')}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        返回
                      </button>
                      <button
                        onClick={handleComplete}
                        disabled={emailLoading || !verificationCode}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {emailLoading ? '验证中...' : '验证'}
                      </button>
                    </div>
                    <button
                      onClick={handleResendCode}
                      disabled={emailLoading}
                      className="w-full text-sm text-blue-600 hover:text-blue-800"
                    >
                      重新发送验证码
                    </button>
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

            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">修改密码</h3>

          {passwordMsg.text && (
            <div className={`mb-4 px-4 py-3 rounded ${
              passwordMsg.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {passwordMsg.text}
            </div>
          )}

          {showChangePassword ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">旧密码</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入旧密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="至少6位"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="再次输入新密码"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowChangePassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordMsg({ type: '', text: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {changingPassword ? '修改中...' : '确认修改'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              修改密码
            </button>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">存储空间</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">已使用</span>
              <span className="font-medium">{storage ? formatBytes(storage.used) : '0 MB'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: storage ? `${Math.min(100, (storage.used / storage.total) * 100)}%` : '0%' 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{storage ? formatBytes(storage.used) : '0 MB'}</span>
              <span>可用 {storage ? formatBytes(storage.available) : '0 MB'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
