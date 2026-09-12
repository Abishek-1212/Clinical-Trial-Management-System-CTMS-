import axiosClient from './axiosClient';

export const adminApi = {
  getAuditLogs: async (page = 0, size = 20) => {
    const response = await axiosClient.get(`/admin/audit-logs?page=${page}&size=${size}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await axiosClient.get('/admin/analytics');
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await axiosClient.get('/admin/system-health');
    return response.data;
  },
};
