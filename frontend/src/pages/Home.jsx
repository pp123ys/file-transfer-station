import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import FileList from '../components/FileList';
import Breadcrumb from '../components/Breadcrumb';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ContextMenu from '../components/ContextMenu';
import FileActionModals from '../components/FileActionModals';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../api/files';

export default function Home() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 模态框状态
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [actionModal, setActionModal] = useState({
    showRename: false,
    showDelete: false,
    showMove: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles(currentFolderId);
      setFiles(response.files);
    } catch (err) {
      console.error('加载文件失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file) => {
    if (file.is_folder) {
      // 进入文件夹
      setBreadcrumbPath([...breadcrumbPath, file]);
      setCurrentFolderId(file.id);
    } else {
      // 下载文件
      filesAPI.downloadFile(file.id, file.name);
    }
  };

  const handleNavigate = (item) => {
    if (item === null) {
      // 返回根目录
      setBreadcrumbPath([]);
      setCurrentFolderId(null);
    } else {
      // 导航到指定文件夹
      const index = breadcrumbPath.findIndex(f => f.id === item.id);
      if (index !== -1) {
        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
        setCurrentFolderId(item.id);
      }
    }
  };

  const handleContextMenu = (e, file) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleRename = (file) => {
    setSelectedFile(file);
    setActionModal({ ...actionModal, showRename: true });
  };

  const handleDelete = (file) => {
    setSelectedFile(file);
    setActionModal({ ...actionModal, showDelete: true });
  };

  const handleMove = (file) => {
    setSelectedFile(file);
    setActionModal({ ...actionModal, showMove: true });
  };

  const handleDownload = async (file) => {
    await filesAPI.downloadFile(file.id, file.name);
  };

  const handleActionModalClose = (type) => {
    setActionModal({ ...actionModal, [`show${type.charAt(0).toUpperCase() + type.slice(1)}`]: false });
    setSelectedFile(null);
  };

  const handleActionSuccess = (message) => {
    alert(message);
    loadFiles();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 工具栏 */}
          <div className="flex justify-between items-center mb-6">
            <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
            <div className="flex space-x-4">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                新建文件夹
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                上传文件
              </button>
            </div>
          </div>

          {/* 文件列表 */}
          <FileList
            files={files}
            onFileClick={handleFileClick}
            onContextMenu={handleContextMenu}
            loading={loading}
          />
        </div>
      </main>

      {/* 模态框 */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        currentFolderId={currentFolderId}
        onUploadSuccess={loadFiles}
      />

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        currentFolderId={currentFolderId}
        onSuccess={loadFiles}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={() => setContextMenu(null)}
          onDownload={handleDownload}
          onRename={handleRename}
          onDelete={handleDelete}
          onMove={handleMove}
        />
      )}

      <FileActionModals
        showRename={actionModal.showRename}
        showDelete={actionModal.showDelete}
        showMove={actionModal.showMove}
        file={selectedFile}
        folders={files}
        onClose={handleActionModalClose}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
