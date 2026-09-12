import axiosClient from './axiosClient';

export const clinicalApi = {
  // eCRF
  getEcrf: async (participantId, visitId) => {
    const response = await axiosClient.get(`/ecrf/${participantId}/${visitId}`);
    return response.data;
  },

  saveEcrf: async (ecrfData) => {
    const response = await axiosClient.post('/ecrf/data', ecrfData);
    return response.data;
  },

  modifyEcrf: async (id, modifyData) => {
    const response = await axiosClient.put(`/ecrf/data/${id}`, modifyData);
    return response.data;
  },

  // Queries
  raiseQuery: async (queryData) => {
    const response = await axiosClient.post('/queries', queryData);
    return response.data;
  },

  respondQuery: async (id, responseData) => {
    const response = await axiosClient.put(`/queries/${id}/respond`, responseData);
    return response.data;
  },

  // Adverse Events
  reportAE: async (aeData) => {
    const response = await axiosClient.post('/adverse-events', aeData);
    return response.data;
  },

  getAEsByStudy: async (studyId) => {
    const response = await axiosClient.get(`/adverse-events/study/${studyId}`);
    return response.data;
  },

  escalateToSAE: async (id) => {
    const response = await axiosClient.put(`/adverse-events/${id}/sae`);
    return response.data;
  },

  // IP Accountability
  recordIpReceipt: async (receiptData) => {
    const response = await axiosClient.post('/ip/receipt', receiptData);
    return response.data;
  },

  dispenseIp: async (dispenseData) => {
    const response = await axiosClient.post('/ip/dispense', dispenseData);
    return response.data;
  },

  getIpAccountability: async (studyId) => {
    const response = await axiosClient.get(`/ip/accountability/${studyId}`);
    return response.data;
  },

  // Regulatory Documents
  uploadDocument: async (docData) => {
    const response = await axiosClient.post('/documents', docData);
    return response.data;
  },

  getDocumentsByStudy: async (studyId) => {
    const response = await axiosClient.get(`/documents/${studyId}`);
    return response.data;
  },
};
