import { filesAPI } from '../api/files';

export default function PreviewModal({ isOpen, onClose, file }) {
  if (!isOpen || !file) return null;

  const getPreviewUrl = () => {
    const baseUrl = filesAPI.getPreviewUrl(file.id);
    return baseUrl ? baseUrl : `/api/files/preview/${file.id}`;
  };

  const getFileType = () => {
    const ext = file.name.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExts = ['pdf'];
    const textExts = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'py', 'java', 'cpp', 'c', 'go', 'rs'];
    const docExts = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
    const audioExts = ['mp3', 'wav', 'ogg'];

    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    if (textExts.includes(ext)) return 'text';
    if (docExts.includes(ext)) return 'doc';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    return 'file';
  };

  const fileType = getFileType();
  const previewUrl = getPreviewUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium truncate flex-1 mr-4">{file.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {fileType === 'image' && (
            <div className="flex justify-center items-center h-full">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}

          {fileType === 'pdf' && (
            <div className="flex justify-center items-center h-full">
              <embed
                src={previewUrl}
                type="application/pdf"
                className="w-full h-[60vh]"
              />
            </div>
          )}

          {fileType === 'video' && (
            <div className="flex justify-center items-center h-full">
              <video
                src={previewUrl}
                controls
                className="max-w-full max-h-[60vh]"
              />
            </div>
          )}

          {fileType === 'audio' && (
            <div className="flex justify-center items-center h-full">
              <audio
                src={previewUrl}
                controls
                className="w-full"
              />
            </div>
          )}

          {fileType === 'text' && (
            <div className="bg-gray-50 rounded-lg p-4 h-[60vh] overflow-auto">
              <iframe
                src={previewUrl}
                className="w-full h-full border-none"
              />
            </div>
          )}

          {(fileType === 'doc' || fileType === 'file') && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-24 h-24 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v14a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1h2zm2 12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v8zM8 4a1 1 0 011-1h6a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V4z" clipRule="evenodd" />
              </svg>
              <p className="text-center">
                该文件类型不支持预览<br />
                请下载查看
              </p>
              <button
                onClick={() => {
                  filesAPI.downloadFile(file.id, file.name);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                下载文件
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex justify-end space-x-4">
          <button
            onClick={() => {
              filesAPI.downloadFile(file.id, file.name);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            下载
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}