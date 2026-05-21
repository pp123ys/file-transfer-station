import { useState } from 'react';
import FileItem from './FileItem';

export default function FileList({ files, onFileClick, onContextMenu, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>暂无文件</p>
        <p className="text-sm mt-1">上传一些文件开始吧</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 表头 */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-sm font-medium text-gray-600">
        <div className="col-span-6">名称</div>
        <div className="col-span-2">大小</div>
        <div className="col-span-3">修改时间</div>
        <div className="col-span-1"></div>
      </div>

      {/* 文件列表 */}
      <div className="divide-y">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onContextMenu={(e) => onContextMenu(e, file)}
          />
        ))}
      </div>
    </div>
  );
}
