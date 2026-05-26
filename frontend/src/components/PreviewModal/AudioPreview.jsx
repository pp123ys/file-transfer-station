import { useEffect } from 'react';

function AudioPreview({ file, onLoadingChange }) {
  useEffect(() => {
    onLoadingChange?.(false);
  }, []);

  return (
    <div className="bg-canvas rounded-lg p-xl">
      <audio controls className="w-full">
        <source src={file.url} />
        您的浏览器不支持音频播放
      </audio>
    </div>
  );
}

export default AudioPreview;
