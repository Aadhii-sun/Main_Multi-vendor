import api from './api';

export const startConversation = async ({ category = 'general', initialMessage } = {}) => {
  const response = await api.post('/chatbot/conversation', {
    category,
    initialMessage,
  });
  return response.data;
};

export const sendMessage = async (conversationId, message) => {
  const response = await api.post('/chatbot/message', {
    conversationId,
    message,
  });
  return response.data;
};

export const fetchSuggestions = async () => {
  const response = await api.get('/chatbot/suggestions');
  return response.data;
};

export const closeConversation = async (conversationId) => {
  const response = await api.put(`/chatbot/conversation/${conversationId}/close`);
  return response.data;
};

