import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function CreateFolderModal({ isOpen, onClose, currentFolderId, onSuccess }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('请输入文件夹名称');
      return;
    }

    setLoading(true);
    try {
      await filesAPI.createFolder(name.trim(), currentFolderId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const drawerVariants = {
    hidden: { y: '100%' },
    visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { y: '100%', transition: { type: 'tween', duration: 0.25 } }
  };

  const modalContent = (
    <div className="bg-canvas rounded-t-3xl shadow-level-5 w-full">
      <div className="flex items-center justify-center py-3">
        <div className="w-10 h-1 bg-body/20 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
        <h2 className="text-display-sm font-semibold text-ink">新建文件夹</h2>
        <button
          onClick={handleClose}
          className="text-mute hover:text-ink transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div>
          <label className="block text-body-sm-strong text-ink mb-2">文件夹名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input w-full"
            placeholder="输入文件夹名称"
            autoFocus
          />
        </div>

        {error && (
          <div className="mt-3 text-caption text-error">{error}</div>
        )}

        <div className="mt-6 flex space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary-sm flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-sm flex-1 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );

  const desktopContent = (
    <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <h2 className="text-display-sm font-semibold text-ink">新建文件夹</h2>
        <button
          onClick={handleClose}
          className="text-mute hover:text-ink transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div>
          <label className="block text-body-sm-strong text-ink mb-2">文件夹名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input w-full"
            placeholder="输入文件夹名称"
            autoFocus
          />
        </div>

        {error && (
          <div className="mt-3 text-caption text-error">{error}</div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary-sm"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary-sm disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />
          
          {isMobile ? (
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {modalContent}
            </motion.div>
          ) : (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {desktopContent}
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
