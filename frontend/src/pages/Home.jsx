import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileDrawer from '../components/MobileDrawer';
import { UploadFAB } from '../components/MobileFAB';
import ActionSheet from '../components/ActionSheet';
import FileList from '../components/FileList';
import Breadcrumb from '../components/Breadcrumb';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ContextMenu from '../components/ContextMenu';
import FileActionModals from '../components/FileActionModals';
import PreviewModal from '../components/PreviewModal';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Home() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentType, setCurrentType] = useState(null);
  const [isTrashView, setIsTrashView] = useState(false);
  
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
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionSheetFile, setActionSheetFile] = useState(null);
  const [storage, setStorage] = useState(null);

  useEffect(() => {
    loadFiles();
    loadStorage();
  }, [currentFolderId, searchQuery, currentType, isTrashView]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      let response;
      if (searchQuery) {
        response = await filesAPI.searchFiles(searchQuery);
      } else if (isTrashView) {
        response = await filesAPI.getTrashFiles();
      } else {
        response = await filesAPI.getFiles(currentFolderId, currentType);
      }
      
      // 处理文件，添加 URL 和缩略图 URL
      const processedFiles = response.files.map(file => ({
        ...file,
        url: filesAPI.getPreviewUrl(file.id),
        thumbnail_url: file.thumbnail_path ? filesAPI.getThumbnailUrl(file.id) : null,
        type: file.name.includes('.') ? 'application/octet-stream' : '',
      }));
      
      setFiles(processedFiles);
    } catch (err) {
      console.error('加载文件失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStorage = async () => {
    try {
      const data = await filesAPI.getStorageInfo();
      setStorage(data);
    } catch (err) {
      console.error('加载存储信息失败:', err);
    }
  };

  const handleFileClick = (file) => {
    if (isTrashView) {
      return;
    }
    
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
    if (isTrashView) {
      return;
    }
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleNavigate = (item) => {
    setSearchQuery('');
    if (item === null || item.id === 'all') {
      setBreadcrumbPath([]);
      setCurrentFolderId(null);
      setCurrentType(null);
      setIsTrashView(false);
    } else if (item.id === 'documents' || item.id === 'images' || item.id === 'videos' || item.id === 'downloads') {
      setBreadcrumbPath([]);
      setCurrentFolderId(null);
      setCurrentType(item.id);
      setIsTrashView(false);
    } else if (item.id === 'trash') {
      setBreadcrumbPath([]);
      setCurrentFolderId(null);
      setCurrentType(null);
      setIsTrashView(true);
    } else {
      const index = breadcrumbPath.findIndex(f => f.id === item.id);
      if (index !== -1) {
        setBreadcrumbPath(breadcrumbPath.slice(0, index + 1));
        setCurrentFolderId(item.id);
      } else {
        setBreadcrumbPath([]);
        setCurrentFolderId(null);
      }
      setCurrentType(null);
      setIsTrashView(false);
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
    setActionModal({ ...actionModal, showDelete: true, isPermanent: isTrashView });
  };

  const handleRestore = async (file) => {
    try {
      await filesAPI.restoreFile(file.id);
      await loadFiles();
    } catch (err) {
      console.error('恢复文件失败:', err);
    }
  };

  const handleMove = (file) => {
    setSelectedFile(file);
    setActionModal({ ...actionModal, showMove: true });
  };

  const handleDownload = async (file) => {
    await filesAPI.downloadFile(file.id, file.name);
  };

  const handleMobileContextMenu = (e, file) => {
    if (isMobile) {
      setActionSheetFile(file);
      setShowActionSheet(true);
    } else {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, file });
    }
  };

  const getActionSheetActions = () => {
    if (!actionSheetFile) return [];
    
    const actions = [];
    
    if (!isTrashView) {
      if (!actionSheetFile.is_folder) {
        actions.push({
          label: '预览',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          onClick: () => handlePreview(actionSheetFile),
        });
        actions.push({
          label: '下载',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
          onClick: () => handleDownload(actionSheetFile),
        });
      }
      actions.push({
        label: '重命名',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => handleRename(actionSheetFile),
      });
      actions.push({
        label: '移动到',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6m6 10h6M3 7l6 6m0 0l6-6m-6 6V3m6 14l6-6m0 0l-6-6m6 6v12" />
          </svg>
        ),
        onClick: () => handleMove(actionSheetFile),
      });
      actions.push({
        label: '删除',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => handleDelete(actionSheetFile),
        destructive: true,
      });
    } else {
      actions.push({
        label: '恢复',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        onClick: () => handleRestore(actionSheetFile),
      });
      actions.push({
        label: '永久删除',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => handleDelete(actionSheetFile),
        destructive: true,
      });
    }
    
    return actions;
  };

  const handleActionModalClose = (type) => {
    setActionModal({ ...actionModal, [`show${type.charAt(0).toUpperCase() + type.slice(1)}`]: false });
    setSelectedFile(null);
  };

  const handleActionSuccess = () => {
    loadFiles();
    loadStorage();
  };

  return (
    <div className="min-h-screen bg-canvas-soft">
      <Navbar 
        onUploadClick={() => setShowUpload(true)} 
        onSearch={handleSearch}
        onMenuClick={() => setShowMobileDrawer(true)}
      />

      {!isMobile && (
        <Sidebar
          onNavigate={handleNavigate}
          currentFolderId={currentFolderId}
          currentType={currentType}
          isTrashView={isTrashView}
          storage={storage}
        />
      )}

      <div className={`${isMobile ? '' : 'ml-64'}`}>
        <main className={`${isMobile ? 'px-4 py-4' : 'max-w-7xl mx-auto py-6 px-6'}`}>
          <AnnouncementBanner />
          <div className="mb-4 tablet:mb-6">
            <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-3">
              <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
              {!isMobile && (
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
              )}
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
            onContextMenu={handleMobileContextMenu}
            loading={loading}
            isTrashView={isTrashView}
          />
        </main>
      </div>

      {isMobile && (
        <UploadFAB onClick={() => setShowUpload(true)} />
      )}

      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        onNavigate={handleNavigate}
        currentFolderId={currentFolderId}
        currentType={currentType}
        isTrashView={isTrashView}
        onSearch={handleSearch}
        storage={storage}
      />

      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={actionSheetFile?.name}
        actions={getActionSheetActions()}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        currentFolderId={currentFolderId}
        onUploadSuccess={loadFiles}
        storage={storage}
      />

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        currentFolderId={currentFolderId}
        onSuccess={loadFiles}
      />

      {contextMenu && !isMobile && (
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
          onRestore={handleRestore}
          isTrashView={isTrashView}
          storage={storage}
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
        isPermanent={actionModal.isPermanent}
      />

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={previewFile}
      />
    </div>
  );
}
