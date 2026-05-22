import { useState } from 'react';
import { filesAPI } from '../api/files';

export default function CreateFolderModal({ isOpen, onClose, currentFolderId, onSuccess }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
    </div>
  );
}
