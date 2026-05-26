function ImageThumbnail({ file, onClick }) {
  return (
    <div 
      className="w-full h-full cursor-pointer overflow-hidden rounded"
      onClick={onClick}
    >
      <img
        src={file.thumbnail_url || file.url}
        alt={file.name}
        className="w-full h-full object-cover transition-transform hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.target.src = file.url;
        }}
      />
    </div>
  );
}

export default ImageThumbnail;
