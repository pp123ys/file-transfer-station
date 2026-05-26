import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/index';
import { register } from '../api/auth';
import { sendVerificationCode } from '../api/email';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    verificationCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [requireEmail, setRequireEmail] = useState(true);
  const [allowRegister, setAllowRegister] = useState(true);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await api.get('/api/auth/register-config');
        setRequireEmail(res.data.require_email);
        setAllowRegister(res.data.allow_register);
      } catch (err) {
        // 默认保持 requireEmail=true
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async () => {
    if (!formData.email) {
      setError('请输入邮箱');
      return;
    }
    setSendingCode(true);
    setError('');
    
    try {
      await sendVerificationCode(formData.email);
      setCodeSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || '发送验证码失败');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    if (requireEmail && (!formData.email || !formData.verificationCode)) {
      setError('请填写邮箱并完成验证');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register({
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        verification_code: formData.verificationCode || null
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center">
        <div className="text-body-md text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!allowRegister) {
    return (
      <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-md">
        <div className="card max-w-md w-full text-center">
          <h1 className="text-display-md mb-md">注册已关闭</h1>
          <p className="text-body-md text-gray-500 mb-lg">当前系统已关闭新用户注册</p>
          <Link to="/login" className="text-link">返回登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-md">
      <div className="card max-w-md w-full">
        <h1 className="text-display-md mb-lg text-center">注册账号</h1>
        
        {error && (
          <div className="bg-error-soft text-error px-sm py-xs rounded-sm mb-md text-body-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="block text-body-sm mb-xs">用户名</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          {requireEmail && (
            <>
              <div>
                <label className="block text-body-sm mb-xs">邮箱</label>
                <div className="flex gap-sm">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input flex-1"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="btn-secondary whitespace-nowrap"
                    disabled={sendingCode || !formData.email}
                  >
                    {sendingCode ? '发送中...' : codeSent ? '重新发送' : '发送验证码'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-body-sm mb-xs">验证码</label>
                <input
                  type="text"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  required
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-body-sm mb-xs">密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <div>
            <label className="block text-body-sm mb-xs">确认密码</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? '注册中...' : '完成注册'}
          </button>
        </form>
        
        <p className="text-body-sm text-center mt-lg">
          已有账号？<Link to="/login" className="text-link">登录</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;