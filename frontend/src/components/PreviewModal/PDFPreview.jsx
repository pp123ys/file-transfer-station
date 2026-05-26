import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PDFPreview({ file, onLoadingChange }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    onLoadingChange?.(false);
  };

  return (
    <div className="bg-canvas rounded-lg overflow-auto max-h-[85vh]">
      <div className="flex justify-center p-md">
        <Document
          file={file.url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>加载中...</div>}
        >
          <Page pageNumber={pageNumber} scale={1.5} />
        </Document>
      </div>

      {numPages && (
        <div className="flex items-center justify-center gap-md p-md bg-canvas-soft">
          <button
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="btn-sm"
          >
            上一页
          </button>
          <span className="text-body">
            第 {pageNumber} / {numPages} 页
          </span>
          <button
            onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="btn-sm"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}

export default PDFPreview;
