import { useEffect, useState } from 'react';
import ImagePreview from './ImagePreview';
import PDFPreview from './PDFPreview';
import DocumentPreview from './DocumentPreview';
import TextPreview from './TextPreview';
import AudioPreview from './AudioPreview';
import VideoPreview from './VideoPreview';
import UnsupportedPreview from './UnsupportedPreview';

const getPreviewType = (file) => {
  const type = file.type?.toLowerCase() || '';
  const name = file.name?.toLowerCase() || '';

  if (type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(name)) {
    return 'image';
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  if (type.includes('word') || /\.(doc|docx)$/.test(name)) {
    return 'document';
  }
  if (type.startsWith('text/') || /\.(txt|md|json|xml|html|css|js)$/.test(name)) {
    return 'text';
  }
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) {
    return 'audio';
  }
  if (type.startsWith('video/') || /\.(mp4|webm|avi)$/.test(name)) {
    return 'video';
  }
  return 'unsupported';
};

function PreviewModal({ file, onClose }) {
  const [loading, setLoading] = useState(true);
  const previewType = getPreviewType(file);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const renderPreview = () => {
    const props = { file, onLoadingChange: setLoading };

    switch (previewType) {
      case 'image':
        return <ImagePreview {...props} />;
      case 'pdf':
        return <PDFPreview {...props} />;
      case 'document':
        return <DocumentPreview {...props} />;
      case 'text':
        return <TextPreview {...props} />;
      case 'audio':
        return <AudioPreview {...props} />;
      case 'video':
        return <VideoPreview {...props} />;
      default:
        return <UnsupportedPreview {...props} />;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl max-h-[90vh] w-full mx-md">
        <button
          onClick={onClose}
          className="absolute top-md right-md z-10 w-10 h-10 bg-canvas rounded-full flex items-center justify-center text-ink hover:bg-canvas-soft transition"
        >
          ✕
        </button>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-on-primary">加载中...</div>
          </div>
        )}

        {renderPreview()}
      </div>
    </div>
  );
}

export default PreviewModal;
