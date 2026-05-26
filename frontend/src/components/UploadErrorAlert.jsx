function UploadErrorAlert({ filename, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="modal max-w-sm text-center">
        <div className="text-4xl mb-md">⚠️</div>
        <h3 className="text-display-sm text-error mb-md">上传失败</h3>
        <p className="text-body mb-sm">
          不支持的文件类型 <strong className="text-ink">{filename}</strong>
        </p>
        <p className="text-mute text-sm">
          请选择图片、文档、音频或视频文件
        </p>
        <button
          onClick={onClose}
          className="btn-primary mt-lg w-full"
        >
          知道了
        </button>
      </div>
    </div>
  );
}

export default UploadErrorAlert;
