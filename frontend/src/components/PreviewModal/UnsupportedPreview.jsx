function UnsupportedPreview({ file }) {
  return (
    <div className="bg-canvas rounded-lg p-xl text-center">
      <div className="text-4xl mb-md">📄</div>
      <h3 className="text-display-sm mb-sm">{file.name}</h3>
      <p className="text-body mb-lg">此文件类型不支持预览</p>
      <a href={file.url} download className="btn-primary inline-block">
        下载文件
      </a>
    </div>
  );
}

export default UnsupportedPreview;
