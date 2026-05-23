import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function UploadModal({ isOpen, onClose, currentFolderId, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const dropZoneRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setProgress({});
      setErrors({});
    }
  }, [isOpen]);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    setErrors({});
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        await filesAPI.uploadFile(file, currentFolderId, (p) => {
          setProgress(prev => ({ ...prev, [i]: p }));
        });
      } catch (err) {
        setErrors(prev => ({ ...prev, [i]: err.response?.data?.detail || '上传失败' }));
      }
    }
    
    setUploading(false);
    onUploadSuccess();
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
    <div className="bg-canvas rounded-t-3xl shadow-level-5 w-full flex flex-col max-h-[85vh]">
      <div className="flex items-center justify-center py-3">
        <div className="w-10 h-1 bg-body/20 rounded-full" />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
        <h2 className="text-display-sm font-semibold text-ink">上传文件</h2>
        <button
          onClick={onClose}
          className="text-mute hover:text-ink transition-colors p-1"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            files.length > 0 ? 'border-hairline bg-canvas-soft' : 'border-hairline hover:border-primary'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-mobile"
          />
          <label htmlFor="file-upload-mobile" className="cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-canvas-soft flex items-center justify-center">
              <svg className="w-6 h-6 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-body-md-strong text-ink mb-1">选择文件上传</p>
            <p className="text-body-sm text-body">点击选择文件</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-canvas-soft rounded-md">
                <div className="flex items-center flex-1 min-w-0">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm text-ink truncate">{file.name}</p>
                    <p className="text-caption text-mute">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                  {progress[index] !== undefined && (
                    <div className="mr-3">
                      <div className="w-20 h-1.5 bg-canvas rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress[index]}%` }}
                        />
                      </div>
                      <p className="text-caption text-mute mt-1">{progress[index]}%</p>
                    </div>
                  )}
                  {errors[index] && (
                    <p className="text-caption text-error mr-3">{errors[index]}</p>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="text-mute hover:text-error transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-hairline">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary-sm flex-1"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn-primary-sm flex-1 disabled:opacity-50"
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
    </div>
  );

  const desktopContent = (
    <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <h2 className="text-display-sm font-semibold text-ink">上传文件</h2>
        <button
          onClick={onClose}
          className="text-mute hover:text-ink transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            files.length > 0 ? 'border-hairline bg-canvas-soft' : 'border-hairline hover:border-primary'
          }`}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload-desktop"
          />
          <label htmlFor="file-upload-desktop" className="cursor-pointer">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-canvas-soft flex items-center justify-center">
              <svg className="w-6 h-6 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-body-md-strong text-ink mb-1">拖拽文件到这里上传</p>
            <p className="text-body-sm text-body">或点击选择文件</p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-canvas-soft rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-body-sm text-ink truncate max-w-xs">{file.name}</p>
                    <p className="text-caption text-mute">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {progress[index] !== undefined && (
                    <div className="mr-3">
                      <div className="w-24 h-1.5 bg-canvas rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress[index]}%` }}
                        />
                      </div>
                      <p className="text-caption text-mute mt-1">{progress[index]}%</p>
                    </div>
                  )}
                  {errors[index] && (
                    <p className="text-caption text-error mr-3">{errors[index]}</p>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="text-mute hover:text-error transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary-sm"
          >
            取消
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn-primary-sm disabled:opacity-50"
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>
      </div>
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
