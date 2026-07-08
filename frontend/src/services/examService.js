import api from './api';

export const getExamsList = async () => {
  const response = await api.get('/exams');
  return response.data; // Array of exams
};

export const getExamById = async (id) => {
  const response = await api.get(`/exams/${id}`);
  return response.data; // { exam, questions }
};

export const submitExamDetails = async (examId, payload) => {
  const response = await api.post(`/exams/${examId}/submit`, payload);
  return response.data; // { attempt, result }
};

export const getResultById = async (attemptId) => {
  const response = await api.get(`/results/${attemptId}`);
  return response.data; // Detailed result metrics
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data; // Statistics, subject weak areas, historical charts maps
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
