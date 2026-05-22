import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileList from '../components/FileList';
import Breadcrumb from '../components/Breadcrumb';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ContextMenu from '../components/ContextMenu';
import FileActionModals from '../components/FileActionModals';
import PreviewModal from '../components/PreviewModal';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../api/files';

export default function Home() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [actionModal, setActionModal] = useState({
    showRename: false,
    showDelete: false,
    showMove: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [currentFolderId, searchQuery]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery) {
        response = await filesAPI.searchFiles(searchQuery);
      } else {
        response = await filesAPI.getFiles(currentFolderId);
      }
      setFiles(response.files);
    } catch (err) {
      console.error('加载文件失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClick = (file) => {
    if (file.is_folder) {
      setBreadcrumbPath([...breadcrumbPath, file]);
      setCurrentFolderId(file.id);
      setSearchQuery('');
    } else {
      setPreviewFile(file);
      setShowPreview(true);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleNavigate = (item) => {
    setSearchQuery('');
    if (item === null) {
      setBreadcrumbPath([]);
      setCurrentFolderId(null);
    } else {
      const index = breadcrumbPath.findIndex(f => f.id === item.id);
      if (index !== -1) {
        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
        setCurrentFolderId(item.id);
      }
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setBreadcrumbPath([]);
    setCurrentFolderId(null);
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

  const handleActionSuccess = () => {
    loadFiles();
  };

  return (
    <div className="min-h-screen bg-canvas-soft">
      <Navbar onUploadClick={() => setShowUpload(true)} onSearch={handleSearch} />

      <Sidebar
        onNavigate={handleNavigate}
        currentFolderId={currentFolderId}
      />

      <div className="ml-64">
        <main className="max-w-7xl mx-auto py-6 px-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="flex items-center px-4 py-2 bg-canvas border border-hairline rounded-md text-body-sm-strong text-ink hover:bg-canvas-soft transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  新建文件夹
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="btn-primary text-body-sm-strong h-9 px-4"
                >
                  <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  上传文件
                </button>
              </div>
            </div>
            
            {searchQuery && (
              <div className="mt-4 flex items-center text-body-sm text-body">
                <svg className="w-4 h-4 mr-2 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索 "{searchQuery}" 的结果
                <button
                  onClick={() => {
                    setSearchQuery('');
                    loadFiles();
                  }}
                  className="ml-2 text-link hover:text-link-deep"
                >
                  清除
                </button>
              </div>
            )}
          </div>

          <FileList
            files={files}
            onFileClick={handleFileClick}
            onContextMenu={handleContextMenu}
            loading={loading}
          />
        </main>
      </div>

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
          onPreview={handlePreview}
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

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={previewFile}
      />
    </div>
  );
}
