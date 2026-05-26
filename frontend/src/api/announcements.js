import api from './index';

export const announcementsAPI = {
  getActive: async () => {
    const response = await api.get('/api/announcements/active');
    return response.data;
  },

  dismiss: async (id) => {
    const response = await api.post(`/api/announcements/${id}/dismiss`);
    return response.data;
  },
};
