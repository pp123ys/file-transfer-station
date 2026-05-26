import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(username, password);
      if (response.user?.email_missing) {
        setEmailPrompt(response.user.email || '');
        setShowEmailPrompt(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const continueToHome = () => {
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-canvas-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>
          <h1 className="text-display-md font-semibold text-ink">罐头</h1>
          <p className="text-body-sm text-body mt-2">安全的私有文件管理</p>
        </div>

        <div className="card-marketing">
          {error && (
            <div className="bg-error-soft text-error-deep px-4 py-3 rounded-sm mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-body-sm-strong text-ink mb-2">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input w-full"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div>
              <label className="block text-body-sm-strong text-ink mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full"
                placeholder="请输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 font-medium text-body-md-strong disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-hairline">
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-body-sm text-link hover:text-link-deep"
              >
                忘记密码？
              </button>
            </div>

            <p className="text-center text-body-sm text-body mt-4">
              还没有账号？{' '}
              <Link to="/register" className="text-link hover:text-link-deep font-medium">
                注册
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-caption text-mute mt-6">
          登录即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    

      {/* 忘记密码弹窗 */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">忘记密码</h3>
              <p className="text-sm text-gray-500 mt-2">
                请联系管理员重置密码
              </p>
              <a
                href="mailto:3378511142@qq.com"
                className="block mt-3 text-blue-600 font-medium text-lg hover:text-blue-800"
              >
                3378511142@qq.com
              </a>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}

      {/* 邮箱补全提示弹窗 */}
      {showEmailPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full bg-warning-soft flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-warning-deep" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">补全邮箱</h3>
              <p className="text-sm text-gray-500 mt-2">
                为了账户安全，请补全您的邮箱地址。您可以在个人资料页面完成此操作。
              </p>
              {emailPrompt && (
                <p className="text-sm text-gray-700 mt-2 font-medium">
                  推荐邮箱：{emailPrompt}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={continueToHome}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                稍后补全
              </button>
              <button
                onClick={goToProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                立即补全
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

