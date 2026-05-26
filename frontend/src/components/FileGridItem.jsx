import ImageThumbnail from './ImageThumbnail';

export default function FileGridItem({ file, onClick, onContextMenu }) {
  const getFileIcon = (name, type) => {
    const ext = name.split('.').pop().toLowerCase();
    const iconColors = {
      'pdf': 'text-error',
      'doc': 'text-blue-600',
      'docx': 'text-blue-600',
      'xls': 'text-green-600',
      'xlsx': 'text-green-600',
      'ppt': 'text-orange-600',
      'pptx': 'text-orange-600',
      'jpg': 'text-purple-600',
      'jpeg': 'text-purple-600',
      'png': 'text-purple-600',
      'gif': 'text-purple-600',
      'mp4': 'text-cyan',
      'zip': 'text-amber-600',
      'rar': 'text-amber-600',
    };

    const color = iconColors[ext] || 'text-body';

    if (file.is_folder) {
      return (
        <svg className="w-12 h-12 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return (
        <svg className={`w-12 h-12 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    if (ext === 'mp4') {
      return (
        <svg className={`w-12 h-12 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className={`w-12 h-12 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const isImage = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
  const showThumbnail = isImage && (file.thumbnail_url || file.url);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="bg-canvas rounded-lg shadow-level-2 p-3 flex flex-col items-center group cursor-pointer hover:shadow-level-3 transition-shadow"
    >
      <div className="w-full aspect-square mb-2 bg-canvas-soft rounded overflow-hidden flex items-center justify-center">
        {showThumbnail ? (
          <ImageThumbnail file={file} onClick={onClick} />
        ) : (
          getFileIcon(file.name, file.type)
        )}
      </div>
      <p className="text-body-sm text-ink text-center truncate w-full group-hover:text-link transition-colors">
        {file.name}
      </p>
      {file.is_folder && (
        <p className="text-caption text-mute mt-0.5">
          {file.item_count || 0} 项目
        </p>
      )}
    </div>
  );
}
