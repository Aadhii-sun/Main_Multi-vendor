/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('AuthContext - Loading from localStorage:', parsedUser);
        console.log('AuthContext - Role from localStorage:', parsedUser?.role);
        setCurrentUser(parsedUser);
        setIsAdmin(parsedUser?.role === 'admin');
      } catch (error) {
        console.warn('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAdmin(false);
    setAuthToken(null);
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setIsAdmin(user?.role === 'admin');
      
      // Debug logging
      console.log('Token Verify - User role from API:', user?.role);
      console.log('Token Verify - Full user object:', user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (authToken) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [authToken, verifyToken]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/signin', { email, password });
      const { token, user } = response.data;
      
      // Clear old data and set new data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setAuthToken(token);
      setCurrentUser(user);
      setIsAdmin(user?.role === 'admin');
      
      // Debug logging
      console.log('=== SIGNIN LOGIN ===');
      console.log('User role from API:', user?.role);
      console.log('isAdmin state set to:', user?.role === 'admin');
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('====================');
      
      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      
      // Better error handling
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return { 
          success: false, 
          error: 'Request timeout. Please check if the backend server is running on port 5000.'
        };
      }
      
      if (error.isNetworkError || error.message?.includes('Network Error') || error.message?.includes('ERR_FAILED')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5000'
        };
      }
      
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'API endpoint not found. Please check if the backend server is running and the API URL is correct.'
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed. Please try again.' 
      };
    }
  };

  const loginWithOtp = async (email, userType) => {
    try {
      const response = await api.post('/otp/send', { email, type: userType });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[loginWithOtp] Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isNetworkError: error.isNetworkError,
        code: error.code
      });

      // Handle specific HTTP status codes
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: 'Backend endpoint not found. The backend may be sleeping. Please try again in a moment.',
          isNetworkError: true
        };
      }

      if (error.response?.status === 429) {
        return { 
          success: false, 
          error: 'Too many requests. Please wait a few minutes before trying again.',
          isNetworkError: false
        };
      }

      // Handle network errors (timeout, connection refused, etc.)
      if (error.isNetworkError || 
          error.code === 'ECONNABORTED' || 
          error.message?.includes('timeout') ||
          error.message?.includes('Network Error') ||
          error.message?.includes('waking up') ||
          !error.response) {
        return { 
          success: false, 
          error: 'Backend is waking up (this may take up to 60 seconds on free tier). Please wait and try again in a moment.',
          isNetworkError: true,
          isBackendSleeping: true
        };
      }
      
      // Handle API error responses
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      return { 
        success: false, 
        error: errorMessage,
        isNetworkError: false
      };
    }
  };

  const verifyOtp = async (email, otp, userType) => {
    try {
      const response = await api.post('/otp/verify', { email, otp, type: userType });
      const { token, user } = response.data;
      
      // CRITICAL: Clear ALL old data first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Set fresh data IMMEDIATELY
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update React state synchronously
      setAuthToken(token);
      setCurrentUser(user);
      setIsAdmin(user?.role === 'admin');
      
      // Debug logging
      console.log('=== OTP VERIFY IN AUTH CONTEXT ===');
      console.log('User role from API:', user?.role);
      console.log('User role type:', typeof user?.role);
      console.log('isAdmin state set to:', user?.role === 'admin');
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('===================================');
      
      // Return user data immediately so Login component can proceed
      // The state will be available in AuthContext for PrivateRoute checks
      return { success: true, user };
    } catch (error) {
      console.error('OTP verification failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid OTP. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.userType || userData.role || 'user',
      };

      await api.post('/auth/signup', payload);
      return { 
        success: true, 
        message: 'Registration successful! Please check your email for verification.' 
      };
    } catch (error) {
      console.error('Registration failed:', error);
      const validationMessage = error.response?.data?.errors?.[0]?.msg;
      const serverMessage = error.response?.data?.message;
      return { 
        success: false, 
        error: validationMessage || serverMessage || error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    loginWithOtp,
    verifyOtp,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
