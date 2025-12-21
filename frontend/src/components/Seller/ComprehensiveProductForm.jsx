import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardMedia,
  InputAdornment,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { createProduct } from '../../services/products';
import { uploadImage } from '../../services/uploads';

const categories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Books',
  'Sports',
  'Beauty',
  'Automotive',
  'Toys',
  'Health',
  'Other'
];

const ComprehensiveProductForm = ({ onSuccess, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      countInStock: '',
      // Optional fields
      subcategory: '',
      brand: '',
      sku: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      tags: [],
      tagInput: '',
      featured: false,
      status: 'active'
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Product name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
      description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters').max(500, 'Description must not exceed 500 characters'),
      price: Yup.number().required('Price is required').min(0.01, 'Price must be at least 0.01'),
      originalPrice: Yup.number().min(0, 'Original price must be positive'),
      category: Yup.string().required('Category is required'),
      countInStock: Yup.number().required('Stock quantity is required').min(0, 'Stock must be 0 or more').integer('Stock must be a whole number'),
      sku: Yup.string(),
      weight: Yup.number().min(0, 'Weight must be positive'),
      dimensions: Yup.object({
        length: Yup.number().min(0),
        width: Yup.number().min(0),
        height: Yup.number().min(0)
      })
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        
        // Validate images
        if (uploadedImages.length === 0) {
          setError('Please upload at least one product image');
          return;
        }

        setUploading(true);

        // Prepare product data
        const productData = {
          name: values.name.trim(),
          description: values.description.trim(),
          price: parseFloat(values.price),
          originalPrice: values.originalPrice ? parseFloat(values.originalPrice) : undefined,
          category: values.category,
          subcategory: values.subcategory?.trim() || undefined,
          brand: values.brand?.trim() || undefined,
          countInStock: parseInt(values.countInStock),
          sku: values.sku?.trim() || undefined,
          weight: values.weight ? parseFloat(values.weight) : undefined,
          dimensions: values.dimensions.length || values.dimensions.width || values.dimensions.height
            ? {
                length: values.dimensions.length ? parseFloat(values.dimensions.length) : undefined,
                width: values.dimensions.width ? parseFloat(values.dimensions.width) : undefined,
                height: values.dimensions.height ? parseFloat(values.dimensions.height) : undefined
              }
            : undefined,
          tags: values.tags.length > 0 ? values.tags : undefined,
          featured: values.featured || false,
          status: values.status || 'active',
          images: uploadedImages.map(img => img.url)
        };

        // Create product
        const result = await createProduct(productData);
        
        // Save product to localStorage for immediate display
        try {
          const storedProducts = JSON.parse(localStorage.getItem('seller_products') || '[]');
          const newProductForDisplay = {
            id: result.product._id,
            ...productData,
            seller: result.product.seller?.name || 'Current Seller',
            rating: 0,
            _id: result.product._id
          };
          localStorage.setItem('seller_products', JSON.stringify([...storedProducts, newProductForDisplay]));
        } catch (storageError) {
          console.warn('Failed to save to localStorage:', storageError);
        }
        
        setSuccess('Product created successfully! Your product is now live and visible to all users.');
        
        // Reset form
        formik.resetForm();
        setUploadedImages([]);
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result.product);
          }, 2000);
        }
      } catch (err) {
        console.error('Product creation error:', err);
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.errors?.[0]?.msg ||
                           err.message || 
                           'Failed to create product. Please check all fields and try again.';
        setError(errorMessage);
      } finally {
        setUploading(false);
      }
    }
  });

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        // Convert to base64
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to Cloudinary
        const result = await uploadImage(dataUrl, 'products');
        return {
          url: result.url,
          publicId: result.publicId,
          name: file.name
        };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedImages([...uploadedImages, ...results]);
      setSuccess(`${results.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           err.message || 
                           'Failed to upload images. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrl.trim());
    } catch (e) {
      setError('Please enter a valid URL');
      return;
    }

    // Add image from URL
    const newImage = {
      url: imageUrl.trim(),
      publicId: `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Image from URL',
      isUrl: true
    };

    setUploadedImages([...uploadedImages, newImage]);
    setImageUrl('');
    setSuccess('Image URL added successfully!');
    setError('');
  };

  const handleAddTag = () => {
    if (formik.values.tagInput.trim() && !formik.values.tags.includes(formik.values.tagInput.trim())) {
      formik.setFieldValue('tags', [...formik.values.tags, formik.values.tagInput.trim()]);
      formik.setFieldValue('tagInput', '');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    formik.setFieldValue('tags', formik.values.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        ➕ Add New Product
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': { fontWeight: 500 },
            animation: 'slideDown 0.3s ease-out'
          }} 
          onClose={() => setError('')}
        >
          ❌ {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': { fontWeight: 500 },
            animation: 'slideDown 0.3s ease-out'
          }} 
          onClose={() => setSuccess('')}
        >
          ✅ {success}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2}>
          {/* ESSENTIAL FIELDS - Always Visible */}
          <Paper sx={{ p: 3, bgcolor: '#ffffff', border: '2px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1a1a1a' }}>
              📋 Basic Information
            </Typography>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                placeholder="e.g., Wireless Headphones"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name ? formik.errors.name : 'What are you selling?'}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                placeholder="Describe your product in detail..."
                multiline
                rows={3}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description ? formik.errors.description : '10-500 characters'}
                sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: '#1a1a1a !important' }}>Category</InputLabel>
                    <Select
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.category && Boolean(formik.errors.category)}
                      label="Category"
                      sx={{ color: '#1a1a1a', '& .MuiOutlinedInput-input': { color: '#1a1a1a' } }}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand (Optional)"
                    name="brand"
                    placeholder="e.g., Samsung, Nike"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* PRICING & STOCK - Always Visible */}
          <Paper sx={{ p: 3, bgcolor: '#ffffff', border: '2px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1a1a1a' }}>
              💰 Pricing & Stock
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  name="price"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price ? formik.errors.price : 'Your current selling price'}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Original Price (Optional)"
                  name="originalPrice"
                  type="number"
                  inputProps={{ step: '0.01' }}
                  value={formik.values.originalPrice}
                  onChange={formik.handleChange}
                  helperText="To show discount percentage"
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Stock Quantity"
                  name="countInStock"
                  type="number"
                  value={formik.values.countInStock}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.countInStock && Boolean(formik.errors.countInStock)}
                  helperText={formik.touched.countInStock ? formik.errors.countInStock : 'How many units do you have?'}
                  sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* PRODUCT IMAGES - Always Visible */}
          <Paper sx={{ p: 3, bgcolor: '#ffffff', border: '2px solid #e0e0e0' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1a1a1a' }}>
              📸 Product Images (Required)
            </Typography>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" style={{ width: '100%' }}>
                    <Button
                      variant="contained"
                      component="span"
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                      disabled={uploading}
                      sx={{ py: 1.5 }}
                    >
                      {uploading ? '⏳ Uploading...' : '📤 Upload Images'}
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Or paste image URL"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddImageUrl}
                      disabled={!imageUrl.trim()}
                      sx={{ minWidth: 80 }}
                    >
                      Add
                    </Button>
                  </Stack>
                </Grid>
              </Grid>

              {uploadedImages.length > 0 && (
                <Grid container spacing={1}>
                  {uploadedImages.map((img, index) => (
                    <Grid key={index} item xs={6} sm={4} md={3}>
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={img.url}
                          alt={`Product ${index + 1}`}
                        />
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveImage(index)}
                          sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.8)' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
              <Typography variant="caption" color="text.secondary">
                ✓ {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} added
              </Typography>
            </Stack>
          </Paper>

          {/* ADVANCED OPTIONS - Collapsible */}
          <Accordion defaultExpanded={false} sx={{ bgcolor: '#ffffff', border: '2px solid #e0e0e0' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                ⚙️ Advanced Options (Optional)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>
                    Shipping Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Weight (kg)"
                        name="weight"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formik.values.weight}
                        onChange={formik.handleChange}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SKU (Stock Keeping Unit)"
                        name="sku"
                        placeholder="Auto-generated if empty"
                        value={formik.values.sku}
                        onChange={formik.handleChange}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Length (cm)"
                        name="dimensions.length"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formik.values.dimensions.length}
                        onChange={formik.handleChange}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Width (cm)"
                        name="dimensions.width"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formik.values.dimensions.width}
                        onChange={formik.handleChange}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Height (cm)"
                        name="dimensions.height"
                        type="number"
                        inputProps={{ step: '0.01' }}
                        value={formik.values.dimensions.height}
                        onChange={formik.handleChange}
                        size="small"
                        sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>
                    Product Tags (Search Keywords)
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      label="Add tag"
                      placeholder="e.g., wireless"
                      value={formik.values.tagInput}
                      onChange={(e) => formik.setFieldValue('tagInput', e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-input': { color: '#1a1a1a' }, '& .MuiInputLabel-root': { color: '#1a1a1a' } }}
                    />
                    <Button size="small" onClick={handleAddTag} variant="outlined">
                      Add
                    </Button>
                  </Stack>
                  {formik.values.tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formik.values.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#222' }}>
                    Product Status
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: '#1a1a1a !important' }}>Status</InputLabel>
                    <Select
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      label="Status"
                      sx={{ color: '#1a1a1a', '& .MuiOutlinedInput-input': { color: '#1a1a1a' } }}
                    >
                      <MenuItem value="active">🟢 Active - Visible to customers</MenuItem>
                      <MenuItem value="inactive">🔴 Inactive - Hidden from view</MenuItem>
                      <MenuItem value="out_of_stock">⚠️ Out of Stock</MenuItem>
                      <MenuItem value="discontinued">❌ Discontinued</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* SUBMIT BUTTONS */}
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={uploading || formik.isSubmitting}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600 }}
            >
              {uploading || formik.isSubmitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                '✓ Create Product'
              )}
            </Button>
            {onCancel && (
              <Button variant="outlined" size="large" onClick={onCancel} sx={{ py: 1.5 }}>
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default ComprehensiveProductForm;