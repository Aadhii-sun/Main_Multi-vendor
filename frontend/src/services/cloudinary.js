// src/services/cloudinary.js

import { CLOUDINARY_CLOUD_NAME } from './api';

const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // You can change this to your upload preset
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_DELETE_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`;

/**
 * Upload image directly to Cloudinary (client-side)
 * @param {File|Blob} file - The image file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path in Cloudinary (e.g., 'products', 'avatars')
 * @param {string} options.publicId - Custom public ID for the image
 * @param {Array} options.tags - Tags for the image
 * @param {Object} options.transformations - Image transformations to apply
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<Object>} Upload result with url, public_id, etc.
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'products',
    publicId = null,
    tags = [],
    transformations = {},
    onProgress = null,
  } = options;

  // Validate file
  if (!file || !(file instanceof File || file instanceof Blob)) {
    throw new Error('Invalid file. Please provide a File or Blob object.');
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image.');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit.');
  }

  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

  // Add optional parameters
  if (folder) {
    formData.append('folder', folder);
  }
  if (publicId) {
    formData.append('public_id', publicId);
  }
  if (tags.length > 0) {
    formData.append('tags', tags.join(','));
  }

  // Add transformations if provided
  if (Object.keys(transformations).length > 0) {
    const transformationString = buildTransformationString(transformations);
    formData.append('transformation', transformationString);
  }

  try {
    // Create XMLHttpRequest for progress tracking
    const xhr = new XMLHttpRequest();

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height,
              format: response.format,
              bytes: response.bytes,
              createdAt: response.created_at,
              ...response,
            });
          } catch (error) {
            reject(new Error('Failed to parse upload response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.error?.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('POST', CLOUDINARY_UPLOAD_URL);
      xhr.send(formData);
    });

    return uploadPromise;
  } catch (error) {
    throw new Error(`Upload error: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<File>} files - Array of image files
 * @param {Object} options - Upload options (same as uploadToCloudinary)
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleToCloudinary = async (files, options = {}) => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Upload image from base64 data URL
 * @param {string} dataUrl - Base64 data URL (e.g., from FileReader)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadBase64ToCloudinary = async (dataUrl, options = {}) => {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  
  // Create a File object from blob
  const file = new File([blob], 'image.png', { type: blob.type });
  
  return uploadToCloudinary(file, options);
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @param {string} apiKey - Cloudinary API key (required for deletion)
 * @param {string} apiSecret - Cloudinary API secret (required for deletion)
 * @returns {Promise<Object>} Delete result
 */
export const deleteFromCloudinary = async (publicId, apiKey, apiSecret) => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  if (!apiKey || !apiSecret) {
    throw new Error('API key and API secret are required for deletion');
  }

  // Note: Deletion typically requires backend implementation for security
  // This is a client-side helper, but deletion should be done server-side
  console.warn('Warning: Image deletion should be done server-side for security.');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('api_key', apiKey);
  formData.append('timestamp', Math.round(new Date().getTime() / 1000).toString());

  // Generate signature (simplified - should be done server-side)
  // For production, use backend endpoint for deletion

  try {
    const response = await fetch(CLOUDINARY_DELETE_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to delete image');
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Delete error: ${error.message}`);
  }
};

/**
 * Build transformation string from options object
 * @param {Object} transformations - Transformation options
 * @returns {string} Transformation string
 */
const buildTransformationString = (transformations) => {
  const parts = [];

  if (transformations.width) parts.push(`w_${transformations.width}`);
  if (transformations.height) parts.push(`h_${transformations.height}`);
  if (transformations.crop) parts.push(`c_${transformations.crop}`);
  if (transformations.gravity) parts.push(`g_${transformations.gravity}`);
  if (transformations.quality) parts.push(`q_${transformations.quality}`);
  if (transformations.format) parts.push(`f_${transformations.format}`);
  if (transformations.angle) parts.push(`a_${transformations.angle}`);
  if (transformations.radius) parts.push(`r_${transformations.radius}`);
  if (transformations.effect) parts.push(`e_${transformations.effect}`);
  if (transformations.opacity) parts.push(`o_${transformations.opacity}`);
  if (transformations.border) parts.push(`bo_${transformations.border}`);
  if (transformations.background) parts.push(`b_${transformations.background}`);

  return parts.join(',');
};

/**
 * Generate Cloudinary URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Transformation options
 * @param {string} format - Image format (auto, jpg, png, webp, etc.)
 * @returns {string} Transformed image URL
 */
export const getCloudinaryUrl = (publicId, transformations = {}, format = 'auto') => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  // Remove leading slash if present
  const cleanPublicId = publicId.startsWith('/') ? publicId.slice(1) : publicId;

  const transformationString = buildTransformationString(transformations);
  const transformationPart = transformationString ? `${transformationString}/` : '';

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationPart}${cleanPublicId}.${format}`;
};

/**
 * Generate optimized image URL for web
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  return getCloudinaryUrl(publicId, {
    width,
    height,
    crop,
    quality,
    format,
  }, format);
};

/**
 * Generate thumbnail URL
 * @param {string} publicId - Public ID of the image
 * @param {number} size - Thumbnail size (square)
 * @returns {string} Thumbnail URL
 */
export const getThumbnailUrl = (publicId, size = 200) => {
  return getCloudinaryUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
    format: 'auto',
  });
};

/**
 * Generate responsive image URL
 * @param {string} publicId - Public ID of the image
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Image quality
 * @returns {string} Responsive image URL
 */
export const getResponsiveImageUrl = (publicId, maxWidth = 1200, quality = 'auto') => {
  return getCloudinaryUrl(publicId, {
    width: maxWidth,
    crop: 'limit',
    quality,
    format: 'auto',
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if invalid
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Match Cloudinary URL pattern
    const pattern = new RegExp(
      `https?://res\\.cloudinary\\.com/${CLOUDINARY_CLOUD_NAME}/image/upload/(?:[^/]+/)?(.+?)(?:\\.[^.]+)?$`
    );
    const match = url.match(pattern);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

/**
 * Validate Cloudinary URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid Cloudinary URL
 */
export const isValidCloudinaryUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return url.includes(`res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`);
};

/**
 * Get image dimensions from Cloudinary URL
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} Image dimensions {width, height}
 */
export const getImageDimensions = async (publicId) => {
  try {
    // Fetch image info from Cloudinary
    const infoUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}.json`;
    const response = await fetch(infoUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image info');
    }

    const data = await response.json();
    return {
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    throw new Error(`Failed to get image dimensions: ${error.message}`);
  }
};

/**
 * Convert File to base64 data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 data URL
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Compress image before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Export cloud name for use in other files
export { CLOUDINARY_CLOUD_NAME };

