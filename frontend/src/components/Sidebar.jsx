import { useState, useEffect } from 'react';
import { filesAPI } from '../api/files';

export default function Sidebar({ onNavigate, currentFolderId }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles(null);
      const folderList = response.files.filter(f => f.is_folder);
      setFolders(folderList);
    } catch (err) {
      console.error('加载文件夹失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    if (expandedFolders.includes(folder.id)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folder.id));
    } else {
      setExpandedFolders([...expandedFolders, folder.id]);
    }
    onNavigate(folder);
  };

  const loadSubFolders = async (parentId) => {
    try {
      const response = await filesAPI.getFiles(parentId);
      return response.files.filter(f => f.is_folder);
    } catch (err) {
      console.error('加载子文件夹失败:', err);
      return [];
    }
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const [subFolders, setSubFolders] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const isExpanded = expandedFolders.includes(folder.id);
    const isActive = currentFolderId === folder.id;

    useEffect(() => {
      if (isExpanded && !loaded) {
        loadSubFolders(folder.id).then(sub => {
          setSubFolders(sub);
          setLoaded(true);
        });
      }
    }, [isExpanded, folder.id, loaded]);

    return (
      <div>
        <div
          onClick={() => handleFolderClick(folder)}
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
            isActive ? 'bg-blue-50 text-blue-600' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 16}px` }}
        >
          {subFolders.length > 0 && (
            <svg
              className={`w-4 h-4 mr-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {subFolders.length === 0 && <span className="w-4 mr-2"></span>}

          <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
          <span className="truncate">{folder.name}</span>
        </div>

        {isExpanded && subFolders.map(subFolder => (
          <FolderItem key={subFolder.id} folder={subFolder} level={level + 1} />
        ))}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 uppercase mb-4">快速访问</h2>

        {/* 全部文件 */}
        <div
          onClick={() => onNavigate(null)}
          className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
            currentFolderId === null ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>全部文件</span>
        </div>

        {/* 加载状态 */}
        {loading ? (
          <div className="px-4 py-2 text-gray-500">加载中...</div>
        ) : (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-4">文件夹</h3>
            {folders.length === 0 ? (
              <p className="px-4 py-2 text-gray-400 text-sm">暂无文件夹</p>
            ) : (
              folders.map(folder => (
                <FolderItem key={folder.id} folder={folder} />
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
