import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, file, onClose, onPreview, onDownload, onRename, onDelete, onMove, onRestore, isTrashView = false }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = isTrashView ? [
    { 
      label: '恢复', 
      icon: 'restore', 
      onClick: () => { onRestore(file); onClose(); },
      show: true 
    },
    { 
      label: '永久删除', 
      icon: 'trash', 
      onClick: () => { onDelete(file); onClose(); },
      show: true,
      danger: true 
    },
  ] : [
    { 
      label: '预览', 
      icon: 'eye', 
      onClick: () => { onPreview(file); onClose(); },
      show: !file.is_folder 
    },
    { 
      label: '下载', 
      icon: 'download', 
      onClick: () => { onDownload(file); onClose(); },
      show: !file.is_folder 
    },
    { 
      label: '重命名', 
      icon: 'edit', 
      onClick: () => { onRename(file); onClose(); },
      show: true 
    },
    { 
      label: '移动', 
      icon: 'move', 
      onClick: () => { onMove(file); onClose(); },
      show: true 
    },
    { 
      label: '删除', 
      icon: 'trash', 
      onClick: () => { onDelete(file); onClose(); },
      show: true,
      danger: true 
    },
  ];

  const getIcon = (iconName) => {
    const icons = {
      'eye': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'download': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      'edit': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      'move': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      'trash': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      'restore': (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    };
    return icons[iconName] || icons['edit'];
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-canvas rounded-md shadow-level-5 py-2 z-50 min-w-[160px]"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 250) }}
    >
      {menuItems.filter(item => item.show).map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`w-full flex items-center px-4 py-2 text-body-sm transition-colors ${
            item.danger ? 'text-error hover:bg-error-soft' : 'text-body hover:text-ink hover:bg-canvas-soft'
          }`}
        >
          {getIcon(item.icon)}
          <span className="ml-3">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
