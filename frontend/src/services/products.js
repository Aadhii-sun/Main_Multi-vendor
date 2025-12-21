import api from './api';

// Get all products
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Create product
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Update product
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete product
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Get seller's products
export const getSellerProducts = async () => {
  const response = await api.get('/products/seller/my-products');
  return response.data;
};

// Search products
export const searchProducts = async (query, params = {}) => {
  const response = await api.get('/products/search', {
    params: { q: query, ...params }
  });
  return response.data;
};

// Get products by category
export const getProductsByCategory = async (category, params = {}) => {
  const response = await api.get(`/products/category/${category}`, { params });
  return response.data;
};

