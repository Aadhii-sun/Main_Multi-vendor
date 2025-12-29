const cloudinary = require('cloudinary').v2;

// Configuration with defaults
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkq9qo8vf',
  api_key: process.env.CLOUDINARY_API_KEY || '799582919956526',
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET
};

// Configure Cloudinary
cloudinary.config(CLOUDINARY_CONFIG);

const ensureConfigured = () => {
  const missing = [];
  if (!CLOUDINARY_CONFIG.cloud_name) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!CLOUDINARY_CONFIG.api_key) missing.push('CLOUDINARY_API_KEY');
  if (!CLOUDINARY_CONFIG.api_secret) missing.push('CLOUDINARY_API_SECRET');
  return missing;
};

exports.uploadBase64 = async (dataUri, folder = 'products') => {
  const missing = ensureConfigured();
  if (missing.length) {
    // If Cloudinary is not configured, return a data URL as fallback
    // This allows development/testing without Cloudinary setup
    console.warn(`Cloudinary not configured (missing: ${missing.join(', ')}). Using data URL as fallback.`);
    
    // Return the data URL directly as a fallback
    // In production, you should configure Cloudinary
    return { 
      url: dataUri, 
      publicId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      width: null,
      height: null,
      isLocal: true
    };
  }
  
  try {
    const res = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }]
    });
    return { 
      url: res.secure_url, 
      publicId: res.public_id, 
      width: res.width, 
      height: res.height,
      isLocal: false
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Fallback to data URL if Cloudinary upload fails
    console.warn('Falling back to data URL due to Cloudinary error');
    return { 
      url: dataUri, 
      publicId: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      width: null,
      height: null,
      isLocal: true
    };
  }
};

exports.deleteByPublicId = async (publicId) => {
  const missing = ensureConfigured();
  if (missing.length) {
    const err = new Error(`Cloudinary not configured: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }
  const res = await cloudinary.uploader.destroy(publicId);
  return res;
};

/**
 * Upload image from URL
 * @param {string} imageUrl - URL of the image to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
exports.uploadFromUrl = async (imageUrl, options = {}) => {
  const missing = ensureConfigured();
  if (missing.length) {
    const err = new Error(`Cloudinary not configured: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }

  try {
    const uploadOptions = {
      folder: options.folder || 'products',
      public_id: options.publicId || undefined,
      resource_type: 'image',
      transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
      ...options
    };

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload from URL error:', error);
    throw new Error(`Failed to upload from URL: ${error.message}`);
  }
};

/**
 * Upload file buffer
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
exports.uploadBuffer = async (buffer, options = {}) => {
  const missing = ensureConfigured();
  if (missing.length) {
    const err = new Error(`Cloudinary not configured: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: options.folder || 'products',
        public_id: options.publicId || undefined,
        resource_type: 'image',
        transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
        ...options
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
              createdAt: result.created_at
            });
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload buffer error:', error);
    throw new Error(`Failed to upload buffer: ${error.message}`);
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
exports.getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  };

  return cloudinary.url(publicId, defaultOptions);
};

/**
 * Generate transformed image URL with auto-crop
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
exports.getTransformedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    crop: options.crop || 'auto',
    gravity: options.gravity || 'auto',
    width: options.width || undefined,
    height: options.height || undefined,
    fetch_format: options.fetch_format || 'auto',
    quality: options.quality || 'auto',
    ...options
  };

  // Remove undefined values
  Object.keys(defaultOptions).forEach(key => {
    if (defaultOptions[key] === undefined) {
      delete defaultOptions[key];
    }
  });

  return cloudinary.url(publicId, defaultOptions);
};

/**
 * Generate thumbnail URL (square crop)
 * @param {string} publicId - Public ID of the image
 * @param {number} size - Thumbnail size (default: 200)
 * @returns {string} Thumbnail URL
 */
exports.getThumbnailUrl = (publicId, size = 200) => {
  return cloudinary.url(publicId, {
    crop: 'auto',
    gravity: 'auto',
    width: size,
    height: size,
    fetch_format: 'auto',
    quality: 'auto'
  });
};

/**
 * Generate responsive image URL
 * @param {string} publicId - Public ID of the image
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Image quality
 * @returns {string} Responsive URL
 */
exports.getResponsiveUrl = (publicId, maxWidth = 1200, quality = 'auto') => {
  return cloudinary.url(publicId, {
    width: maxWidth,
    crop: 'limit',
    fetch_format: 'auto',
    quality: quality
  });
};

/**
 * Get image info
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} Image information
 */
exports.getImageInfo = async (publicId) => {
  const missing = ensureConfigured();
  if (missing.length) {
    const err = new Error(`Cloudinary not configured: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
      version: result.version
    };
  } catch (error) {
    console.error('Cloudinary get image info error:', error);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

/**
 * Upload multiple images
 * @param {Array<string>} dataUris - Array of base64 data URLs
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
exports.uploadMultiple = async (dataUris, options = {}) => {
  const uploadPromises = dataUris.map(dataUri => 
    exports.uploadBase64(dataUri, options.folder || 'products')
  );
  return Promise.all(uploadPromises);
};

/**
 * Delete multiple images
 * @param {Array<string>} publicIds - Array of public IDs
 * @returns {Promise<Object>} Delete results
 */
exports.deleteMultiple = async (publicIds) => {
  const missing = ensureConfigured();
  if (missing.length) {
    const err = new Error(`Cloudinary not configured: ${missing.join(', ')}`);
    err.status = 500;
    throw err;
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary delete multiple error:', error);
    throw new Error(`Failed to delete multiple images: ${error.message}`);
  }
};






