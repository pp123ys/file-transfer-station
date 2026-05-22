import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-display-md font-semibold text-ink">CloudFile</h1>
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
            <p className="text-center text-body-sm text-body">
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
    </div>
  );
}
