const {
  uploadBase64,
  deleteByPublicId,
  uploadFromUrl,
  uploadBuffer,
  getOptimizedUrl,
  getTransformedUrl,
  getThumbnailUrl,
  getResponsiveUrl,
  getImageInfo,
  uploadMultiple,
  deleteMultiple
} = require('../services/uploadService');

// Upload image from base64 data URL
exports.uploadImage = async (req, res) => {
  try {
    const { file, folder } = req.body; // file: base64 data URL
    if (!file || typeof file !== 'string' || !file.startsWith('data:')) {
      return res.status(400).json({ message: 'Provide a base64 data URL in "file"' });
    }
    const result = await uploadBase64(file, folder || 'products');
    // Return in format expected by frontend: { url, publicId }
    res.status(201).json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      message: 'Uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Image upload failed';
    
    // Check if it's a Cloudinary configuration error
    if (errorMessage.includes('Cloudinary not configured')) {
      return res.status(500).json({ 
        message: 'Image upload service not configured. Please contact administrator.',
        error: errorMessage 
      });
    }
    
    res.status(statusCode).json({ 
      message: 'Image upload failed', 
      error: errorMessage 
    });
  }
};

// Upload image from URL
exports.uploadImageFromUrl = async (req, res) => {
  try {
    const { imageUrl, folder, publicId } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ message: 'Provide a valid image URL' });
    }
    const result = await uploadFromUrl(imageUrl, { folder: folder || 'products', publicId });
    res.status(201).json({
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      message: 'Uploaded successfully'
    });
  } catch (error) {
    console.error('Upload from URL error:', error);
    res.status(error.status || 500).json({ 
      message: 'Image upload from URL failed', 
      error: error.message 
    });
  }
};

// Upload multiple images
exports.uploadMultipleImages = async (req, res) => {
  try {
    const { files, folder } = req.body; // files: array of base64 data URLs
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'Provide an array of base64 data URLs in "files"' });
    }
    const results = await uploadMultiple(files, { folder: folder || 'products' });
    res.status(201).json({
      images: results.map(r => ({
        url: r.url,
        publicId: r.publicId,
        width: r.width,
        height: r.height
      })),
      message: `${results.length} image(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    res.status(error.status || 500).json({ 
      message: 'Multiple image upload failed', 
      error: error.message 
    });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const result = await deleteByPublicId(publicId);
    res.json({ message: 'Deleted', result });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(error.status || 500).json({ message: 'Image delete failed', error: error.message });
  }
};

// Delete multiple images
exports.deleteMultipleImages = async (req, res) => {
  try {
    const { publicIds } = req.body;
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ message: 'Provide an array of publicIds' });
    }
    const result = await deleteMultiple(publicIds);
    res.json({ message: 'Deleted', result });
  } catch (error) {
    console.error('Delete multiple error:', error);
    res.status(error.status || 500).json({ 
      message: 'Multiple image delete failed', 
      error: error.message 
    });
  }
};

// Get optimized URL
exports.getOptimizedUrl = async (req, res) => {
  try {
    const { publicId, ...options } = req.query;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const url = getOptimizedUrl(publicId, options);
    res.json({ url, publicId });
  } catch (error) {
    console.error('Get optimized URL error:', error);
    res.status(500).json({ message: 'Failed to generate URL', error: error.message });
  }
};

// Get transformed URL
exports.getTransformedUrl = async (req, res) => {
  try {
    const { publicId, ...options } = req.query;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const url = getTransformedUrl(publicId, options);
    res.json({ url, publicId, transformations: options });
  } catch (error) {
    console.error('Get transformed URL error:', error);
    res.status(500).json({ message: 'Failed to generate URL', error: error.message });
  }
};

// Get thumbnail URL
exports.getThumbnailUrl = async (req, res) => {
  try {
    const { publicId, size } = req.query;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const url = getThumbnailUrl(publicId, size ? parseInt(size) : 200);
    res.json({ url, publicId, size: size || 200 });
  } catch (error) {
    console.error('Get thumbnail URL error:', error);
    res.status(500).json({ message: 'Failed to generate URL', error: error.message });
  }
};

// Get responsive URL
exports.getResponsiveUrl = async (req, res) => {
  try {
    const { publicId, maxWidth, quality } = req.query;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const url = getResponsiveUrl(
      publicId,
      maxWidth ? parseInt(maxWidth) : 1200,
      quality || 'auto'
    );
    res.json({ url, publicId, maxWidth: maxWidth || 1200, quality: quality || 'auto' });
  } catch (error) {
    console.error('Get responsive URL error:', error);
    res.status(500).json({ message: 'Failed to generate URL', error: error.message });
  }
};

// Get image info
exports.getImageInfo = async (req, res) => {
  try {
    const { publicId } = req.query;
    if (!publicId) return res.status(400).json({ message: 'publicId is required' });
    const info = await getImageInfo(publicId);
    res.json(info);
  } catch (error) {
    console.error('Get image info error:', error);
    res.status(error.status || 500).json({ 
      message: 'Failed to get image info', 
      error: error.message 
    });
  }
};


