import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function PreviewModal({ isOpen, onClose, file }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && file) {
      setLoading(true);
      setPreviewUrl(filesAPI.getPreviewUrl(file.id));
      setLoading(false);
    }
  }, [isOpen, file]);

  const isImage = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  const isText = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    return ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'go'].includes(ext);
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
    <div className="bg-canvas rounded-t-3xl shadow-level-5 w-full max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-center py-3">
        <div className="w-10 h-1 bg-body/20 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
        <div className="flex items-center min-w-0 flex-1">
          <svg className="w-5 h-5 mr-3 text-body flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0a3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-body-md-strong text-ink truncate min-w-0">{file.name}</span>
        </div>
        <button onClick={onClose} className="text-mute hover:text-ink ml-3 p-1 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isImage(file.name) ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain mx-auto"
          />
        ) : isText(file.name) ? (
          <iframe
            src={previewUrl}
            title={file.name}
            className="w-full h-[50vh] border border-hairline rounded-md bg-canvas-soft"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-canvas-soft flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-body-md-strong text-ink mb-2">无法预览此文件类型</p>
            <p className="text-body-sm text-body">点击下载按钮查看文件</p>
          </div>
        )}
      </div>
      
      <div className="p-5 border-t border-hairline">
        <button
          onClick={() => filesAPI.downloadFile(file.id, file.name)}
          className="btn-primary-sm w-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </button>
      </div>
    </div>
  );

  const desktopContent = (
    <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-3 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0a3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="text-body-md-strong text-ink truncate max-w-md">{file.name}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => filesAPI.downloadFile(file.id, file.name)}
            className="btn-secondary-sm flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </button>
          <button onClick={onClose} className="text-mute hover:text-ink">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isImage(file.name) ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="max-w-full max-h-[70vh] object-contain mx-auto"
          />
        ) : isText(file.name) ? (
          <iframe
            src={previewUrl}
            title={file.name}
            className="w-full h-[60vh] border border-hairline rounded-md bg-canvas-soft"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-canvas-soft flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-body-md-strong text-ink mb-2">无法预览此文件类型</p>
            <p className="text-body-sm text-body">点击下载按钮查看文件</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && file && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
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
