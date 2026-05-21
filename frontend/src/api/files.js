import api from './index';

export const filesAPI = {
  // 获取文件列表
  getFiles: async (parentId = null) => {
    const params = parentId !== null ? { parent_id: parentId } : {};
    const response = await api.get('/api/files', { params });
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
};
