import { useState, useEffect } from 'react';

function TextPreview({ file, onLoadingChange }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(file.url)
      .then(res => res.text())
      .then(text => {
        setContent(text);
        setLoading(false);
        onLoadingChange?.(false);
      })
      .catch(() => {
        setContent('无法加载文件内容');
        setLoading(false);
        onLoadingChange?.(false);
      });
  }, [file.url]);

  return (
    <div className="bg-canvas rounded-lg p-lg max-h-[85vh] overflow-auto">
      <pre className="whitespace-pre-wrap font-mono text-sm text-ink">
        {loading ? '加载中...' : content}
      </pre>
    </div>
  );
}

export default TextPreview;
