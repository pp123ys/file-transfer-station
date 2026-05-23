import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'all', label: '全部文件', icon: 'folder' },
  { id: 'documents', label: '文档', icon: 'file-text' },
  { id: 'images', label: '图片', icon: 'image' },
  { id: 'videos', label: '视频', icon: 'video' },
  { id: 'trash', label: '回收站', icon: 'trash' },
];

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  onNavigate, 
  currentFolderId, 
  currentType, 
  isTrashView,
  onSearch 
}) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowUserMenu(false);
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onClose();
    }
  };

  const handleNavigate = (item) => {
    onNavigate(item);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    window.location.href = '/login';
  };

  const getIcon = (iconName) => {
    const icons = {
      'folder': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      'file-text': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'image': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'video': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'download': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      'trash': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    };
    return icons[iconName] || icons['folder'];
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const drawerVariants = {
    hidden: { x: '-100%' },
    visible: { 
      x: 0, 
      transition: { 
        type: 'spring', 
        damping: 25, 
        stiffness: 200,
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    },
    exit: { 
      x: '-100%', 
      transition: { 
        type: 'tween', 
        duration: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-canvas z-50 shadow-level-5 flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between p-md border-b border-hairline"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="text-display-sm font-semibold text-ink">罐头</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-md hover:bg-canvas-soft transition-colors"
              >
                <svg className="w-6 h-6 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>

            {/* Search */}
            <motion.div 
              className="p-md border-b border-hairline"
              variants={itemVariants}
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文件..."
                  className="w-full bg-canvas-soft border border-hairline rounded-md pl-10 pr-4 py-2 text-body-sm text-ink placeholder:text-mute focus:outline-none focus:border-primary transition-colors"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mute">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mute hover:text-body"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </form>
            </motion.div>

            {/* Navigation */}
            <motion.div 
              className="flex-1 overflow-y-auto"
              variants={itemVariants}
            >
              <div className="p-md">
                <h3 className="text-caption-mono text-mute uppercase tracking-wider mb-3">快速访问</h3>
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-md text-body-sm transition-all duration-200 ${
                        (item.id === 'all' && !currentFolderId && !currentType && !isTrashView) || 
                        (item.id === 'trash' && isTrashView) || 
                        (item.id !== 'all' && item.id !== 'trash' && currentType === item.id)
                          ? 'bg-canvas-soft text-ink font-medium'
                          : 'text-body hover:text-ink hover:bg-canvas-soft'
                      }`}
                    >
                      {getIcon(item.icon)}
                      <span className="ml-3">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8">
                  <h3 className="text-caption-mono text-mute uppercase tracking-wider mb-3">我的文件夹</h3>
                  <nav className="space-y-1">
                    <button
                      onClick={() => handleNavigate(null)}
                      className={`w-full flex items-center px-3 py-2.5 rounded-md text-body-sm transition-all duration-200 ${
                        currentFolderId === null
                          ? 'bg-canvas-soft text-ink font-medium'
                          : 'text-body hover:text-ink hover:bg-canvas-soft'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="ml-3">根目录</span>
                    </button>
                  </nav>
                </div>
              </div>
            </motion.div>

            {/* User Profile */}
            <motion.div 
              className="border-t border-hairline p-md"
              variants={itemVariants}
            >
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-full flex items-center p-3 rounded-md hover:bg-canvas-soft transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3 text-left flex-1">
                    <p className="text-body-sm-strong text-ink">{user?.username}</p>
                    <p className="text-caption text-mute">{user?.email || '个人云盘'}</p>
                  </div>
                  <svg className="w-4 h-4 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 right-0 mb-2 bg-canvas rounded-md shadow-level-4 border border-hairline overflow-hidden"
                    >
                      <a
                        href="/profile"
                        onClick={onClose}
                        className="flex items-center px-4 py-3 text-body-sm text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        个人资料
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-body-sm text-error hover:text-error-deep hover:bg-error-soft/20 transition-colors border-t border-hairline"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        退出登录
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
