import { motion } from 'framer-motion';

export default function MobileFileCard({ file, onClick, onLongPress, isTrashView }) {
  const getFileIcon = (name, isFolder) => {
    if (isFolder) {
      return (
        <svg className="w-10 h-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }

    const ext = name.split('.').pop().toLowerCase();
    const iconColors = {
      'pdf': 'text-error',
      'doc': 'text-blue-600',
      'docx': 'text-blue-600',
      'xls': 'text-green-600',
      'xlsx': 'text-green-600',
      'ppt': 'text-orange-600',
      'pptx': 'text-orange-600',
      'jpg': 'text-purple-600',
      'jpeg': 'text-purple-600',
      'png': 'text-purple-600',
      'gif': 'text-purple-600',
      'mp4': 'text-cyan',
      'zip': 'text-amber-600',
      'rar': 'text-amber-600',
    };

    const color = iconColors[ext] || 'text-body';

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return (
        <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    if (ext === 'mp4') {
      return (
        <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const handleTouchStart = (e) => {
    const timer = setTimeout(() => {
      if (onLongPress) {
        onLongPress(e);
      }
    }, 500);
    e.currentTarget.dataset.longPressTimer = timer;
  };

  const handleTouchEnd = (e) => {
    const timer = e.currentTarget.dataset.longPressTimer;
    if (timer) {
      clearTimeout(parseInt(timer));
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onLongPress) onLongPress(e);
      }}
      className="bg-canvas rounded-lg shadow-level-2 p-4 flex flex-col items-center justify-center min-h-[100px] touch-target"
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-2">
        {getFileIcon(file.name, file.is_folder)}
      </div>
      <p className="text-body-sm text-ink text-center truncate w-full">
        {file.name}
      </p>
      <p className="text-caption text-mute mt-1">
        {file.is_folder ? `${file.item_count || 0} 项目` : formatSize(file.size)}
      </p>
    </motion.div>
  );
}
