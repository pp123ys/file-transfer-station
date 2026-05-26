function ImagePreview({ file, onLoadingChange }) {
  return (
    <div className="flex items-center justify-center">
      <img
        src={file.url}
        alt={file.name}
        className="max-w-full max-h-[85vh] object-contain rounded-md"
        onLoad={() => onLoadingChange?.(false)}
        onError={() => onLoadingChange?.(false)}
      />
    </div>
  );
}

export default ImagePreview;
