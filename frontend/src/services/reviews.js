import api from './api';

export const getProductReviews = async (productId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => {
  const response = await api.get(`/products/${productId}/reviews`, {
    params: { page, limit, sortBy, sortOrder }
  });
  return response.data;
};

export const addProductReview = async (productId, rating, comment) => {
  const response = await api.post(`/products/${productId}/reviews`, {
    rating,
    comment
  });
  return response.data;
};

export const updateProductReview = async (productId, reviewId, rating, comment) => {
  const response = await api.put(`/products/${productId}/reviews/${reviewId}`, {
    rating,
    comment
  });
  return response.data;
};

export const deleteProductReview = async (productId, reviewId) => {
  const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
  return response.data;
};





