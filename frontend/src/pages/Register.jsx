import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await sendVerificationCode(formData.email);
      setCodeSent(true);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        verification_code: formData.verificationCode
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-soft flex items-center justify-center px-md">
      <div className="card max-w-md w-full">
        <h1 className="text-display-md mb-lg text-center">注册账号</h1>
        
        {error && (
          <div className="bg-error-soft text-error px-sm py-xs rounded-sm mb-md text-body-sm">
            {error}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-md">
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
            
            <div>
              <label className="block text-body-sm mb-xs">邮箱</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                required
              />
            </div>
            
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? '发送中...' : '发送验证码'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-md">
            <div className="bg-canvas-soft px-md py-sm rounded-md text-body-sm">
              验证码已发送至 <strong>{formData.email}</strong>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-link ml-sm"
              >
                修改邮箱
              </button>
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
        )}
        
        <p className="text-body-sm text-center mt-lg">
          已有账号？<Link to="/login" className="text-link">登录</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
