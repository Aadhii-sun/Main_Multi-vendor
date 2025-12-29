import api from './api';
import {
  uploadToCloudinary,
  uploadBase64ToCloudinary,
  uploadMultipleToCloudinary,
  getOptimizedImageUrl,
  getThumbnailUrl,
  getResponsiveImageUrl,
  extractPublicIdFromUrl,
  isValidCloudinaryUrl,
  compressImage,
} from './cloudinary';

/**
 * Upload image via backend API (existing method)
 * file should be a base64 data URL (e.g., from FileReader)
 */
export const uploadImage = async (dataUrl, folder = 'products') => {
  const res = await api.post('/uploads', { file: dataUrl, folder });
  return res.data; // { url, publicId }
};

/**
 * Upload image directly to Cloudinary (client-side)
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options (folder, tags, transformations, onProgress)
 * @returns {Promise<Object>} Upload result
 */
export const uploadImageDirect = async (file, options = {}) => {
  return uploadToCloudinary(file, { folder: options.folder || 'products', ...options });
};

/**
 * Upload image from base64 to Cloudinary (client-side)
 * @param {string} dataUrl - Base64 data URL
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImageBase64 = async (dataUrl, options = {}) => {
  return uploadBase64ToCloudinary(dataUrl, { folder: options.folder || 'products', ...options });
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<File>} files - Array of image files
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  return uploadMultipleToCloudinary(files, { folder: options.folder || 'products', ...options });
};

/**
 * Delete image via backend API
 */
export const deleteImage = async (publicId) => {
  const res = await api.delete('/uploads', { data: { publicId } });
  return res.data;
};

// Re-export Cloudinary utility functions
export {
  getOptimizedImageUrl,
  getThumbnailUrl,
  getResponsiveImageUrl,
  extractPublicIdFromUrl,
  isValidCloudinaryUrl,
  compressImage,
};











