import axiosClient from './axiosClient';

export const studyApi = {
  getAll: async () => {
    const response = await axiosClient.get('/studies');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`/studies/${id}`);
    return response.data;
  },

  create: async (studyData) => {
    const response = await axiosClient.post('/studies', studyData);
    return response.data;
  },

  update: async (id, studyData) => {
    const response = await axiosClient.put(`/studies/${id}`, studyData);
    return response.data;
  },

  lockDatabase: async (id) => {
    const response = await axiosClient.post(`/studies/${id}/lock`);
    return response.data;
  },

  unlockDatabase: async (id) => {
    const response = await axiosClient.post(`/studies/${id}/unlock`);
    return response.data;
  },
};
