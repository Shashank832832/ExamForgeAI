import api from './api';

export const uploadDocument = async (formData, onUploadProgress) => {
  const response = await api.post('/ocr/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return response.data; // { rawText, parsedQuestions, tempExamId }
};

export const saveAdminExam = async (examPayload) => {
  const response = await api.post('/ocr/finalize', examPayload);
  return response.data; // Newly created Exam object
};

export const generateSimilarQuestion = async (questionId) => {
  const response = await api.post(`/ocr/questions/${questionId}/similar`);
  return response.data; // { question }
};

export const explainQuestionSolution = async (questionId) => {
  const response = await api.post(`/ocr/questions/${questionId}/explain`);
  return response.data; // { explanation }
};
