import FileItem from './FileItem';
import MobileFileCard from './MobileFileCard';
import Loading from './Loading';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function FileList({ files, onFileClick, onContextMenu, loading, isTrashView = false }) {
  const isMobile = useIsMobile();

  const formatSize = (bytes) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? '刚刚' : minutes + ' 分钟前';
      }
      return hours + ' 小时前';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return days + ' 天前';
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <div className="bg-canvas rounded-md shadow-level-2 p-8">
        <Loading />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-canvas-soft rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-canvas flex items-center justify-center">
          <svg className="w-8 h-8 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 0 00-2-2H6a2 0 00-2 2v12a2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-body-md-strong text-ink mb-2">暂无文件</h3>
        <p className="text-body-sm text-body">上传文件或创建文件夹开始使用</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {files.map((file) => (
          <MobileFileCard
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onLongPress={(e) => onContextMenu(e, file)}
            isTrashView={isTrashView}
          />
        ))}
      </div>
    );
  }

  const folders = files.filter(f => f.is_folder);
  const docs = files.filter(f => !f.is_folder);

  return (
    <div className="bg-canvas rounded-md shadow-level-2">
      <div className="hidden grid-cols-12 gap-4 px-6 py-3 border-b border-hairline text-caption-mono text-mute uppercase tracking-wider">
        <div className="col-span-5">名称</div>
        <div className="col-span-2 text-right">大小</div>
        <div className="col-span-5 text-right">{isTrashView ? '删除时间' : '修改时间'}</div>
      </div>
      
      <div className="divide-y divide-hairline">
        {folders.length > 0 && (
          <div>
            {folders.map((folder) => (
              <FileItem
                key={folder.id}
                file={folder}
                onClick={() => onFileClick(folder)}
                onContextMenu={(e) => onContextMenu(e, folder)}
                formatSize={formatSize}
                formatDate={formatDate}
                isTrashView={isTrashView}
              />
            ))}
          </div>
        )}
        
        {docs.length > 0 && folders.length > 0 && (
          <div className="border-t border-hairline">
            <div className="px-6 py-2 text-caption-mono text-mute uppercase tracking-wider">文件</div>
          </div>
        )}
        
        {docs.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onContextMenu={(e) => onContextMenu(e, file)}
            formatSize={formatSize}
            formatDate={formatDate}
            isTrashView={isTrashView}
          />
        ))}
      </div>
    </div>
  );
}
