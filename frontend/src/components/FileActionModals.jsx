import { useState, useEffect } from 'react';
import { filesAPI } from '../api/files';

export default function FileActionModals({ showRename, showDelete, showMove, file, folders, onClose, onSuccess, isPermanent = false }) {
  const [newName, setNewName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (showRename && file) {
      setNewName(file.name);
      setError('');
    }
    if (showMove) {
      setSelectedFolder(null);
      setError('');
    }
  }, [showRename, showMove, file]);

  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      onClose('rename');
      return;
    }

    setLoading(true);
    try {
      await filesAPI.updateFile(file.id, { name: newName.trim() });
      onSuccess();
      onClose('rename');
    } catch (err) {
      setError(err.response?.data?.detail || '重命名失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (isPermanent) {
        await filesAPI.permanentDeleteFile(file.id);
      } else {
        await filesAPI.deleteFile(file.id);
      }
      onSuccess();
      onClose('delete');
    } catch (err) {
      setError(err.response?.data?.detail || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (selectedFolder === null) {
      onClose('move');
      return;
    }

    setLoading(true);
    try {
      await filesAPI.updateFile(file.id, { parent_id: selectedFolder });
      onSuccess();
      onClose('move');
    } catch (err) {
      setError(err.response?.data?.detail || '移动失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (type) => {
    setError('');
    onClose(type);
  };

  if (showRename) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
            <h2 className="text-display-sm font-semibold text-ink">重命名</h2>
            <button onClick={() => handleClose('rename')} className="text-mute hover:text-ink">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <label className="block text-body-sm-strong text-ink mb-2">名称</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="form-input w-full"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            {error && <div className="mt-3 text-caption text-error">{error}</div>}
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => handleClose('rename')} className="btn-secondary-sm">取消</button>
              <button onClick={handleRename} disabled={loading} className="btn-primary-sm disabled:opacity-50">
                {loading ? '处理中...' : '确定'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showDelete) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
            <h2 className="text-display-sm font-semibold text-ink">删除确认</h2>
            <button onClick={() => handleClose('delete')} className="text-mute hover:text-ink">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-error-soft flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-body-md-strong text-ink">确认{isPermanent ? '永久删除' : '删除'}?</p>
                <p className="text-body-sm text-body mt-1">
                  {isPermanent ? '此操作将永久删除文件，无法恢复。' : (file.is_folder ? '此操作将删除该文件夹及其所有内容。' : '此操作无法撤销。')}
                </p>
                <p className="text-body-sm text-mute mt-2">" {file.name} "</p>
              </div>
            </div>
            {error && <div className="mt-4 text-caption text-error">{error}</div>}
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => handleClose('delete')} className="btn-secondary-sm">取消</button>
              <button onClick={handleDelete} disabled={loading} className="btn-primary-sm disabled:opacity-50 bg-error hover:bg-error-deep">
                {loading ? '删除中...' : isPermanent ? '永久删除' : '删除'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showMove) {
    const currentFolders = folders.filter(f => f.is_folder && f.id !== file.id);
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-canvas rounded-lg shadow-level-5 w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
            <h2 className="text-display-sm font-semibold text-ink">移动到</h2>
            <button onClick={() => handleClose('move')} className="text-mute hover:text-ink">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <label className="block text-body-sm-strong text-ink mb-3">选择目标文件夹</label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center px-4 py-3 rounded-md text-body-sm transition-colors ${
                  selectedFolder === null ? 'bg-canvas-soft text-ink' : 'text-body hover:bg-canvas-soft'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                根目录
              </button>
              {currentFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-md text-body-sm transition-colors ${
                    selectedFolder === folder.id ? 'bg-canvas-soft text-ink' : 'text-body hover:bg-canvas-soft'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {folder.name}
                </button>
              ))}
              {currentFolders.length === 0 && (
                <p className="text-center text-body-sm text-mute py-4">暂无其他文件夹</p>
              )}
            </div>
            {error && <div className="mt-4 text-caption text-error">{error}</div>}
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => handleClose('move')} className="btn-secondary-sm">取消</button>
              <button onClick={handleMove} disabled={loading} className="btn-primary-sm disabled:opacity-50">
                {loading ? '移动中...' : '移动'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
