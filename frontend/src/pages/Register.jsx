import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, email);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败，请重试');
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
          <p className="text-body-sm text-body mt-2">创建您的私有云盘</p>
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
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-body-sm-strong text-ink mb-2">邮箱（可选）</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full"
                placeholder="your@email.com"
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
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-body-sm-strong text-ink mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input w-full"
                placeholder="请再次输入密码"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 font-medium text-body-md-strong disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-hairline">
            <p className="text-center text-body-sm text-body">
              已有账号？{' '}
              <Link to="/login" className="text-link hover:text-link-deep font-medium">
                登录
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-caption text-mute mt-6">
          注册即表示您同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
