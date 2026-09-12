import axiosClient from './axiosClient';

export const participantApi = {
  register: async (participantData) => {
    const response = await axiosClient.post('/participants', participantData);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/participants/${id}`);
    return response.data;
  },

  getMe: async () => {
    const response = await axiosClient.get('/participants/me');
    return response.data;
  },

  getAll: async () => {
    const response = await axiosClient.get('/participants');
    return response.data;
  },

  getByStudy: async (studyId) => {
    const response = await axiosClient.get(`/participants/study/${studyId}`);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await axiosClient.put(`/participants/${id}/status`, statusData);
    return response.data;
  },

  recordConsent: async (id, consentData) => {
    const response = await axiosClient.post(`/participants/${id}/consent`, consentData);
    return response.data;
  },
};
