import api from './index';

export const filesAPI = {
  // 获取文件列表
  getFiles: async (parentId = null, fileType = null) => {
    const params = {};
    if (parentId !== null) {
      params.parent_id = parentId;
    }
    if (fileType) {
      params.file_type = fileType;
    }
    const response = await api.get('/api/files', { params });
    return response.data;
  },

  // 获取回收站文件
  getTrashFiles: async () => {
    const response = await api.get('/api/files/trash');
    return response.data;
  },

  // 恢复文件
  restoreFile: async (fileId) => {
    const response = await api.post(`/api/files/${fileId}/restore`);
    return response.data;
  },

  // 永久删除文件
  permanentDeleteFile: async (fileId) => {
    const response = await api.delete(`/api/files/${fileId}/permanent`);
    return response.data;
  },

  // 创建文件夹
  createFolder: async (name, parentId = null) => {
    const response = await api.post('/api/files/folder', {
      name,
      parent_id: parentId
    });
    return response.data;
  },

  // 上传文件
  uploadFile: async (file, parentId = null, onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId !== null) {
      formData.append('parent_id', parentId);
    }

    const response = await api.post('/api/files/upload', formData, {
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    });
    return response.data;
  },

  // 下载文件
  downloadFile: async (fileId, fileName) => {
    const response = await api.get(`/api/files/download/${fileId}`, {
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // 获取文件预览URL
  getPreviewUrl: (fileId) => {
    const token = localStorage.getItem('access_token');
    const base = `${api.defaults.baseURL}/api/files/preview/${fileId}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },

  // 更新文件（重命名/移动）
  updateFile: async (fileId, data) => {
    const response = await api.put(`/api/files/${fileId}`, data);
    return response.data;
  },

  // 删除文件
  deleteFile: async (fileId) => {
    const response = await api.delete(`/api/files/${fileId}`);
    return response.data;
  },

  // 搜索文件
  searchFiles: async (keyword) => {
    const response = await api.get('/api/files/search', {
      params: { q: keyword }
    });
    return response.data;
  },
  // 获取存储使用情况
  getStorageInfo: async () => {
    const response = await api.get('/api/files/storage');
    return response.data;
  },
};