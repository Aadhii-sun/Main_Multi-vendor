import api from './api';

// Dashboard stats
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

// User management
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/user/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/admin/user/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/user/${id}`);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.put(`/admin/user/${id}/toggle-status`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/admin/users/stats');
  return response.data;
};

// Seller management
export const getPendingSellers = async () => {
  const response = await api.get('/admin/sellers/pending');
  return response.data;
};

export const getApprovedSellers = async () => {
  const response = await api.get('/sellers/approved/list');
  return response.data;
};

export const getAllSellers = async () => {
  const response = await api.get('/sellers');
  return response.data;
};

export const getSellerById = async (id) => {
  const response = await api.get(`/sellers/${id}`);
  return response.data;
};

export const approveSeller = async (sellerId) => {
  const response = await api.put(`/admin/seller/${sellerId}/approve`);
  return response.data;
};

export const rejectSeller = async (sellerId) => {
  const response = await api.put(`/admin/seller/${sellerId}/reject`);
  return response.data;
};

export const getSellerAnalytics = async (sellerId, params = {}) => {
  const response = await api.get(`/sellers/${sellerId}/analytics`, { params });
  return response.data;
};

// Order management
export const getAllOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrdersByStatus = async (status) => {
  const response = await api.get(`/orders/status/${status}`);
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, status, notes) => {
  const response = await api.put(`/orders/${id}/status`, { status, notes });
  return response.data;
};

export const cancelOrder = async (id) => {
  const response = await api.put(`/orders/${id}/cancel`);
  return response.data;
};

export const editOrder = async (id, data) => {
  const response = await api.put(`/orders/${id}/edit`, data);
  return response.data;
};

// Product management
export const getAllProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const approveProduct = async (id) => {
  const response = await api.put(`/products/${id}/approve`);
  return response.data;
};

export const rejectProduct = async (id) => {
  const response = await api.put(`/products/${id}/reject`);
  return response.data;
};

export const getPendingProducts = async () => {
  const response = await api.get('/products/pending');
  return response.data;
};

