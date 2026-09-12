import axiosClient from './axiosClient';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axiosClient.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API warning:', e);
    } finally {
      localStorage.removeItem('ctms_token');
      localStorage.removeItem('ctms_user');
    }
  },
};
