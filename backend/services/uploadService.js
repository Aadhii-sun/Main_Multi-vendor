const cloudinary = require('cloudinary').v2;

// Configure from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const ensureConfigured = () => {
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
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






