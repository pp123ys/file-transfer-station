import { useEffect } from 'react';

function VideoPreview({ file, onLoadingChange }) {
  useEffect(() => {
    onLoadingChange?.(false);
  }, []);

  return (
    <div className="bg-canvas rounded-lg overflow-hidden">
      <video controls className="max-w-full max-h-[85vh]">
        <source src={file.url} />
        您的浏览器不支持视频播放
      </video>
    </div>
  );
}

export default VideoPreview;
