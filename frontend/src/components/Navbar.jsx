import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Navbar({ onUploadClick, onSearch, onMenuClick }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav className="bg-canvas border-b border-hairline sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 tablet:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 mr-2 text-ink hover:bg-canvas-soft rounded-md transition-colors touch-target"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-display-sm font-semibold text-ink">罐头</span>
          </div>
        </div>

        {!isMobile && (
          <>
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文件..."
                  className="w-full bg-canvas-soft border border-hairline rounded-md px-4 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-mute hover:text-ink"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onUploadClick}
                className="btn-primary text-body-sm-strong h-9 px-4"
              >
                <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                上传
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-body-sm-strong text-body hover:text-ink transition-colors px-3 py-2 rounded-full hover:bg-canvas-soft"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">{user?.username}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-canvas rounded-md shadow-level-5 py-2 z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-body-sm text-body hover:text-ink hover:bg-canvas-soft"
                    >
                      个人资料
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-body-sm text-body hover:text-ink hover:bg-canvas-soft"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isMobile && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 text-ink hover:bg-canvas-soft rounded-full transition-colors touch-target"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-canvas rounded-md shadow-level-5 py-2 z-50">
                <div className="px-4 py-2 text-body-sm text-mute border-b border-hairline">
                  {user?.username}
                </div>
                <a
                  href="/profile"
                  className="block px-4 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft touch-target"
                >
                  个人资料
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft touch-target"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
