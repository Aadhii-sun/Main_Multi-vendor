import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { CheckCircle, Cancel, Visibility, Edit } from '@mui/icons-material';

const AdminProducts = () => {
  const [tab, setTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all products from sellers and admins
  const allProducts = useMemo(() => {
    try {
      const sellers = JSON.parse(localStorage.getItem('seller_products')) || [];
      const admins = JSON.parse(localStorage.getItem('admin_products')) || [];
      return [...sellers, ...admins].map(p => ({
        ...p,
        status: p.status || 'pending', // pending, approved, rejected
        approved: p.approved !== undefined ? p.approved : false,
      }));
    } catch {
      return [];
    }
  }, []);

  const pendingProducts = allProducts.filter(p => p.status === 'pending' || !p.approved);
  const approvedProducts = allProducts.filter(p => p.approved || p.status === 'approved');
  const rejectedProducts = allProducts.filter(p => p.status === 'rejected');

  const filteredProducts = useMemo(() => {
    const products = tab === 0 ? pendingProducts : tab === 1 ? approvedProducts : rejectedProducts;
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tab, searchTerm, pendingProducts, approvedProducts, rejectedProducts]);

  const updateProductStatus = (productId, status, approved) => {
    try {
      // Update in seller products
      const sellers = JSON.parse(localStorage.getItem('seller_products')) || [];
      const updatedSellers = sellers.map(p => 
        p.id === productId ? { ...p, status, approved } : p
      );
      localStorage.setItem('seller_products', JSON.stringify(updatedSellers));

      // Update in admin products
      const admins = JSON.parse(localStorage.getItem('admin_products')) || [];
      const updatedAdmins = admins.map(p => 
        p.id === productId ? { ...p, status, approved } : p
      );
      localStorage.setItem('admin_products', JSON.stringify(updatedAdmins));

      window.location.reload(); // Refresh to show updated status
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const handleApprove = (product) => {
    updateProductStatus(product.id, 'approved', true);
  };

  const handleReject = (product) => {
    updateProductStatus(product.id, 'rejected', false);
  };

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
      </Box>

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
            label={`Pending (${pendingProducts.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
          <Tab 
            label={`Approved (${approvedProducts.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
          <Tab 
            label={`Rejected (${rejectedProducts.length})`}
            sx={{ fontWeight: 600, '&.Mui-selected': { color: '#667eea' } }}
          />
        </Tabs>
      </Paper>

      {filteredProducts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {tab === 0 ? 'No pending products' : tab === 1 ? 'No approved products' : 'No rejected products'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id} sx={{ display: 'flex' }}>
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
                    image={product.image || product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
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
                    <Typography variant="h6" color="primary" sx={{ flexShrink: 0 }}>
                      ${Number(product.price || 0).toFixed(2)}
                      {product.discountPrice && (
                        <Typography component="span" sx={{ textDecoration: 'line-through', ml: 1, color: 'text.secondary' }}>
                          ${Number(product.price).toFixed(2)}
                        </Typography>
                      )}
                    </Typography>
                    <Chip 
                      label={product.status || 'pending'} 
                      size="small"
                      color={product.approved ? 'success' : product.status === 'rejected' ? 'error' : 'warning'}
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
                  height: '80px',
                  boxSizing: 'border-box',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'flex-start'
                }}>
                  <Stack direction="row" spacing={1} sx={{ width: '100%', flexWrap: 'wrap', gap: 1 }}>
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
                    {tab === 0 && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => handleApprove(product)}
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
                          sx={{
                            '&:hover': { background: 'rgba(239, 68, 68, 0.05)' }
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </Stack>
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
                    src={selectedProduct.image || selectedProduct.images?.[0] || 'https://via.placeholder.com/400?text=No+Image'}
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
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                      <Typography>{selectedProduct.category || 'N/A'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedProduct.status || 'pending'} 
                        color={selectedProduct.approved ? 'success' : selectedProduct.status === 'rejected' ? 'error' : 'warning'}
                      />
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
              {tab === 0 && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleApprove(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      handleReject(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminProducts;
