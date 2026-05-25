import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { admin, logout } = useAdminAuth();

  const menuItems = [
    { path: '/admin', label: '仪表盘', icon: 'dashboard' },
    { path: '/admin/users', label: '用户管理', icon: 'users' },
    { path: '/admin/files', label: '文件管理', icon: 'files' },
    { path: '/admin/settings', label: '系统设置', icon: 'settings' },
    { path: '/admin/logs', label: '操作日志', icon: 'logs' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      'dashboard': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'users': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'files': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      'settings': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'logs': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'logout': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
    };
    return icons[iconName] || icons['dashboard'];
  };

  return (
    <aside className="w-64 bg-gray-900 text-white fixed left-0 top-0 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-8">管理后台</h1>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gray-800 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              {getIcon(item.icon)}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white">{admin?.username}</p>
            <p className="text-xs text-gray-400">管理员</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
        >
          {getIcon('logout')}
          <span className="ml-3">登出</span>
        </button>
      </div>
    </aside>
  );
}
