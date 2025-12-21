// src/services/auth.js
import api from './api';

export const sendOTP = async (email, userType = 'user') => {
  return api.post('/otp/send', { email, type: userType });
};

export const verifyOTP = async (email, otp, userType = 'user') => {
  return api.post('/otp/verify', { email, otp, type: userType });
};

export const adminLogin = async (email, password) => {
  return api.post('/auth/signin', { email, password });
};

export const getCurrentUser = async () => {
  return api.get('/auth/me');
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};