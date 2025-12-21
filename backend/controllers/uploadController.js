const { uploadBase64, deleteByPublicId } = require('../services/uploadService');

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


