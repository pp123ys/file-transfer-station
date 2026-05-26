import api from './index';

export const authAPI = {
  register: async (username, password, email) => {
    const response = await api.post('/api/auth/register', {
      username,
      password,
      email,
    });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};
