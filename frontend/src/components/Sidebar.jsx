export default function Sidebar({ onNavigate, currentFolderId, currentType, isTrashView, storage }) {
  const menuItems = [
    { id: 'all', label: '全部文件', icon: 'folder' },
    { id: 'documents', label: '文档', icon: 'file-text' },
    { id: 'images', label: '图片', icon: 'image' },
    { id: 'videos', label: '视频', icon: 'video' },
    { id: 'trash', label: '回收站', icon: 'trash' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      'folder': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

  return (
    <aside className="w-64 bg-canvas border-r border-hairline fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 pb-20">
        <h2 className="text-caption-mono text-mute uppercase tracking-wider mb-3">快速访问</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-body-sm transition-all duration-200 ${
                (item.id === 'all' && !currentFolderId && !currentType && !isTrashView) || (item.id === 'trash' && isTrashView) || (item.id !== 'all' && item.id !== 'trash' && currentType === item.id)
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
          <h2 className="text-caption-mono text-mute uppercase tracking-wider mb-3">我的文件夹</h2>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate(null)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-body-sm transition-all duration-200 ${
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
    
        {storage && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-hairline bg-canvas px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-caption-mono text-mute uppercase tracking-wider">存储空间</span>
              <span className="text-caption-mono text-mute">{Math.round(storage.used / storage.total * 100)}%</span>
            </div>
            <div className="w-full h-1 rounded-sm bg-hairline overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-300 ${
                  storage.used / storage.total > 0.95 ? 'bg-error' :
                  storage.used / storage.total > 0.8 ? 'bg-warning' : 'bg-ink'
                }`}
                style={{ width: `${Math.min(100, storage.used / storage.total * 100)}%` }}
              />
            </div>
            <p className="text-body-sm text-body mt-1">
              {(storage.used / (1024 ** 3)).toFixed(1)} GB / {(storage.total / (1024 ** 3)).toFixed(1)} GB
            </p>
          </div>
        )}

</aside>
  );
}
