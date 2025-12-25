import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  TextField,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility, Delete, Refresh } from '@mui/icons-material';
import { getAllProducts, deleteProduct, approveProduct, rejectProduct, getPendingProducts } from '../services/admin';

const AdminProducts = () => {
  const [tab, setTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllProducts({ limit: 1000, allStatus: true }); // Get all products including pending/inactive
      const productsList = response.products || response || [];
      setProducts(productsList);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(productId);
      await deleteProduct(productId);
      setProducts(products.filter(p => p._id !== productId));
      if (selectedProduct && selectedProduct._id === productId) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleApprove = async (product) => {
    try {
      setActionLoading(product._id);
      await approveProduct(product._id);
      await fetchProducts(); // Refresh products
      if (selectedProduct && selectedProduct._id === product._id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Error approving product:', err);
      alert(err.response?.data?.message || 'Failed to approve product');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (product) => {
    try {
      setActionLoading(product._id);
      await rejectProduct(product._id);
      await fetchProducts(); // Refresh products
      if (selectedProduct && selectedProduct._id === product._id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Error rejecting product:', err);
      alert(err.response?.data?.message || 'Failed to reject product');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter products by status
  const pendingProducts = products.filter(p => p.status === 'pending' || !p.status || p.status === 'inactive');
  const approvedProducts = products.filter(p => p.status === 'active' || p.status === 'approved');
  const rejectedProducts = products.filter(p => p.status === 'rejected');

  const filteredProducts = useMemo(() => {
    const productsList = tab === 0 ? pendingProducts : tab === 1 ? approvedProducts : rejectedProducts;
    if (!searchTerm) return productsList;
    return productsList.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tab, searchTerm, pendingProducts, approvedProducts, rejectedProducts]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant="h4"
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          📦 Product Management
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: 'rgba(102, 126, 234, 0.05)',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.08)'
                }
              }
            }}
          />
          <IconButton onClick={fetchProducts} color="primary">
            <Refresh />
          </IconButton>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, borderRadius: 2.5, border: '1px solid rgba(0,0,0,0.08)' }}>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: 3
            }
          }}
        >
          <Tab 
            label={`All Products (${products.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
          <Tab 
            label={`Pending (${pendingProducts.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
          <Tab 
            label={`Active (${approvedProducts.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
        </Tabs>
      </Paper>

      {filteredProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {tab === 0 ? 'No products found' : tab === 1 ? 'No pending products' : 'No active products'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id} sx={{ display: 'flex' }}>
              <Card sx={{ 
                height: '520px',
                width: '100%',
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden',
                boxSizing: 'border-box',
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }
              }}>
                <Box sx={{ 
                  height: '240px', 
                  width: '100%', 
                  overflow: 'hidden', 
                  position: 'relative',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
                }}>
                  <CardMedia
                    component="img"
                    image={product.images?.[0] || product.image || 'https://via.placeholder.com/300?text=No+Image'}
                    alt={product.name}
                    sx={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300?text=Image+Error';
                    }}
                  />
                </Box>
                <CardContent sx={{ 
                  height: '200px',
                  display: 'flex', 
                  flexDirection: 'column', 
                  p: 2,
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxSizing: 'border-box'
                }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                      minHeight: '2.4em',
                      maxHeight: '2.4em',
                      mb: 1
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Stack spacing={1} sx={{ flexGrow: 1, minHeight: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      Category: {product.category || 'N/A'}
                    </Typography>
                    {product.seller && (
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        Seller: {product.seller.name || product.seller.email || 'N/A'}
                      </Typography>
                    )}
                    <Typography variant="h6" color="primary" sx={{ flexShrink: 0 }}>
                      ${Number(product.price || 0).toFixed(2)}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <Typography component="span" sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary', fontSize: '0.9rem' }}>
                          ${Number(product.originalPrice).toFixed(2)}
                        </Typography>
                      )}
                    </Typography>
                    <Chip 
                      label={product.status || 'pending'} 
                      size="small"
                      color={
                        product.status === 'active' || product.status === 'approved' ? 'success' : 
                        product.status === 'rejected' ? 'error' : 
                        'warning'
                      }
                      sx={{ flexShrink: 0, width: 'fit-content' }}
                    />
                    {product.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flexShrink: 0
                        }}
                      >
                        {product.description.substring(0, 100)}...
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ 
                  p: 2, 
                  pt: 1.5, 
                  flexShrink: 0,
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedProduct(product)}
                    sx={{
                      color: '#667eea',
                      borderColor: '#667eea',
                      '&:hover': { background: 'rgba(102, 126, 234, 0.05)' }
                    }}
                  >
                    View
                  </Button>
                  {(product.status === 'pending' || !product.status || product.status === 'inactive') && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(product)}
                        disabled={actionLoading === product._id}
                        sx={{
                          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                          '&:hover': { transform: 'translateY(-2px)' }
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={() => handleReject(product)}
                        disabled={actionLoading === product._id}
                        sx={{
                          '&:hover': { background: 'rgba(239, 68, 68, 0.05)' }
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={deleting === product._id ? <CircularProgress size={16} /> : <Delete />}
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    sx={{
                      '&:hover': { background: 'rgba(239, 68, 68, 0.05)' }
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} maxWidth="md" fullWidth>
        {selectedProduct && (
          <>
            <DialogTitle>{selectedProduct.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={selectedProduct.images?.[0] || selectedProduct.image || 'https://via.placeholder.com/400?text=No+Image'}
                    alt={selectedProduct.name}
                    sx={{ width: '100%', borderRadius: 2, boxShadow: 1 }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400?text=Image+Error';
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                      <Typography variant="h5">${Number(selectedProduct.price || 0).toFixed(2)}</Typography>
                      {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          ${Number(selectedProduct.originalPrice).toFixed(2)}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                      <Typography>{selectedProduct.category || 'N/A'}</Typography>
                    </Box>
                    {selectedProduct.seller && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Seller</Typography>
                        <Typography>{selectedProduct.seller.name || selectedProduct.seller.email || 'N/A'}</Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedProduct.status || 'pending'} 
                        color={
                          selectedProduct.status === 'active' || selectedProduct.status === 'approved' ? 'success' : 
                          selectedProduct.status === 'rejected' ? 'error' : 
                          'warning'
                        }
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Stock</Typography>
                      <Typography>{selectedProduct.countInStock || 0} units</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                      <Typography>{selectedProduct.description || 'No description'}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedProduct(null)}>Close</Button>
              {(selectedProduct.status === 'pending' || !selectedProduct.status || selectedProduct.status === 'inactive') && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleApprove(selectedProduct);
                    }}
                    disabled={actionLoading === selectedProduct._id}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      handleReject(selectedProduct);
                    }}
                    disabled={actionLoading === selectedProduct._id}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="outlined"
                color="error"
                startIcon={deleting === selectedProduct._id ? <CircularProgress size={16} /> : <Delete />}
                onClick={() => {
                  handleDelete(selectedProduct._id);
                  setSelectedProduct(null);
                }}
                disabled={deleting === selectedProduct._id}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
