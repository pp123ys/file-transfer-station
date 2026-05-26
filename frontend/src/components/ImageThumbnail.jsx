function ImageThumbnail({ file, onClick }) {
  const imageSrc = file.thumbnail_url || file.url;
  
  return (
    <div 
      className="w-full h-full cursor-pointer overflow-hidden rounded"
      onClick={onClick}
    >
      <img
        src={imageSrc}
        alt={file.name}
        className="w-full h-full object-cover transition-transform hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // 如果缩略图加载失败，尝试使用原始图片
          if (file.thumbnail_url && file.url) {
            e.target.src = file.url;
          }
        }}
      />
    </div>
  );
}

export default ImageThumbnail;
