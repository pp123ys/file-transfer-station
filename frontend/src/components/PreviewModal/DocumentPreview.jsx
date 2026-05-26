import { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import UnsupportedPreview from './UnsupportedPreview';

function DocumentPreview({ file, onLoadingChange }) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(file.url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
      .then(result => {
        setContent(result.value);
        onLoadingChange?.(false);
      })
      .catch(err => {
        setError('无法加载文档');
        onLoadingChange?.(false);
      });
  }, [file.url]);

  if (error) {
    return <UnsupportedPreview file={file} />;
  }

  return (
    <div className="bg-canvas rounded-lg p-xl max-h-[85vh] overflow-auto">
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

export default DocumentPreview;
