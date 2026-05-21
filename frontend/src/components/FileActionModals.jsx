import { useState, useEffect } from 'react';
import { filesAPI } from '../api/files';

export default function FileActionModals({
  showRename,
  showDelete,
  showMove,
  file,
  folders,
  onClose,
  onSuccess
}) {
  const [newName, setNewName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 初始化
  useEffect(() => {
    if (file) {
      setNewName(file.name);
    }
  }, [file]);

  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      onClose('rename');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await filesAPI.updateFile(file.id, { name: newName });
      onSuccess('重命名成功');
      onClose('rename');
    } catch (err) {
      setError(err.response?.data?.detail || '重命名失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await filesAPI.deleteFile(file.id);
      onSuccess('删除成功');
      onClose('delete');
    } catch (err) {
      setError(err.response?.data?.detail || '删除失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (selectedFolderId === file.parent_id) {
      onClose('move');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await filesAPI.updateFile(file.id, { parent_id: selectedFolderId });
      onSuccess('移动成功');
      onClose('move');
    } catch (err) {
      setError(err.response?.data?.detail || '移动失败');
    } finally {
      setLoading(false);
    }
  };

  // 重命名弹窗
  if (showRename && file) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h3 className="text-lg font-medium mb-4">重命名</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            autoFocus
          />

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onClose('rename')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleRename}
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '处理中...' : '确定'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 删除确认弹窗
  if (showDelete && file) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h3 className="text-lg font-medium mb-2">确认删除</h3>
          <p className="text-gray-600 mb-4">
            确定要删除 {file.is_folder ? '文件夹' : '文件'} "{file.name}" 吗？
            {file.is_folder && <span className="block text-red-500 mt-2">文件夹内的所有内容也将被删除</span>}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onClose('delete')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? '处理中...' : '删除'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 移动弹窗
  if (showMove && file && folders) {
    const moveableFolders = folders.filter(f => f.id !== file.id && f.is_folder);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h3 className="text-lg font-medium mb-4">移动到</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mb-4 max-h-60 overflow-y-auto">
            <div
              onClick={() => setSelectedFolderId(null)}
              className={`p-2 cursor-pointer rounded ${
                selectedFolderId === null ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              根目录
            </div>
            {moveableFolders.map(folder => (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`p-2 cursor-pointer rounded flex items-center ${
                  selectedFolderId === folder.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                {folder.name}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => onClose('move')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={handleMove}
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '处理中...' : '移动'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
