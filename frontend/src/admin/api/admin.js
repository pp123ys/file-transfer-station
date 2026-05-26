import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || '') 
  : '';

const adminAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await adminAPI.post('/api/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentAdmin: async () => {
    const response = await adminAPI.get('/api/admin/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await adminAPI.post('/api/admin/auth/logout');
    return response.data;
  },
};

export const adminUsersAPI = {
  getUsers: async (page = 1, perPage = 20, search = null) => {
    const params = { page, per_page: perPage };
    if (search) {
      params.search = search;
    }
    const response = await adminAPI.get('/api/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await adminAPI.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  toggleUserActive: async (userId) => {
    const response = await adminAPI.patch(`/api/admin/users/${userId}`, {
      action: 'toggle_active',
    });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminAPI.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  changeUserPassword: async (userId, newPassword) => {
    const response = await adminAPI.put(`/api/admin/users/${userId}/password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  setUserQuota: async (userId, storageQuotaGb) => {
    const response = await adminAPI.put(`/api/admin/users/${userId}/quota`, {
      storage_quota_gb: storageQuotaGb,
    });
    return response.data;
  },
};

export const adminFilesAPI = {
  getFiles: async (page = 1, perPage = 20, userId = null, search = null) => {
    const params = { page, per_page: perPage };
    if (userId !== null) {
      params.user_id = userId;
    }
    if (search) {
      params.search = search;
    }
    const response = await adminAPI.get('/api/admin/files', { params });
    return response.data;
  },

  getFileDetail: async (fileId) => {
    const response = await adminAPI.get(`/api/admin/files/${fileId}`);
    return response.data;
  },

  deleteFile: async (fileId, permanent = false) => {
    const response = await adminAPI.delete(`/api/admin/files/${fileId}`, {
      params: { permanent },
    });
    return response.data;
  },
};

export const adminDashboardAPI = {
  getDashboard: async (limit = 20) => {
    const response = await adminAPI.get('/api/admin/dashboard', {
      params: { limit },
    });
    return response.data;
  },
};

export const adminSettingsAPI = {
  getSettings: async () => {
    const response = await adminAPI.get('/api/admin/settings');
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await adminAPI.put('/api/admin/settings', {
      settings,
    });
    return response.data;
  },
};

export const adminAuditLogsAPI = {
  getLogs: async (page = 1, perPage = 20, action = null, targetType = null, startDate = null, endDate = null) => {
    const params = { page, per_page: perPage };
    if (action) {
      params.action = action;
    }
    if (targetType) {
      params.target_type = targetType;
    }
    if (startDate) {
      params.start_date = startDate;
    }
    if (endDate) {
      params.end_date = endDate;
    }
    const response = await adminAPI.get('/api/admin/audit-logs', { params });
    return response.data;
  },
};

export const adminAnnouncementsAPI = {
  getAnnouncements: async () => {
    const response = await adminAPI.get('/api/admin/announcements');
    return response.data;
  },

  createAnnouncement: async (data) => {
    const response = await adminAPI.post('/api/admin/announcements', data);
    return response.data;
  },

  updateAnnouncement: async (id, data) => {
    const response = await adminAPI.put(`/api/admin/announcements/${id}`, data);
    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await adminAPI.delete(`/api/admin/announcements/${id}`);
    return response.data;
  },

  toggleAnnouncement: async (id) => {
    const response = await adminAPI.patch(`/api/admin/announcements/${id}/toggle`);
    return response.data;
  },
};

export default adminAPI;
