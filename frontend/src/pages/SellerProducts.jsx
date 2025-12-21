import React, { useState } from 'react';
import { 
  Box, Button, Container, Grid, Paper, Typography, Table, TableHead, TableRow, 
  TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Chip, Stack
} from '@mui/material';
import { Delete as DeleteIcon, CheckCircle as CheckCircleIcon, WarningAmber as AlertIcon } from '@mui/icons-material';
import ComprehensiveProductForm from '../components/Seller/ComprehensiveProductForm';

const STORAGE_KEY = 'seller_products';

const readProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveProducts = (list) => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

const SellerProducts = () => {
  const [products, setProducts] = useState(readProducts());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleComprehensiveFormSuccess = async (newProduct) => {
    // Refresh products list - fetch from API or reload
    try {
      // In production, you would fetch from API here
      // For now, we'll just refresh the local products
      const updatedProducts = readProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Failed to refresh products:', error);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const next = products.filter((p) => p.id !== productToDelete.id);
      setProducts(next);
      saveProducts(next);
    }
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  const removeProduct = (id) => {
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    saveProducts(next);
  };

  const seedSampleProducts = () => {
    const sampleProducts = [
      {
        id: `SP-${Date.now()}-1`,
        name: 'Wireless Bluetooth Headphones',
        price: 79.99,
        discountPrice: 59.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        category: 'Electronics',
        description: 'Premium wireless headphones with noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.',
        rating: 4.5,
        seller: 'Current Seller'
      },
      {
        id: `SP-${Date.now()}-2`,
        name: 'Smart Fitness Watch',
        price: 199.99,
        discountPrice: 149.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
        category: 'Electronics',
        description: 'Track your health with heart rate monitoring, sleep analysis, GPS, and 50+ workout modes. Water-resistant design for all activities.',
        rating: 4.7,
        seller: 'Current Seller'
      },
      {
        id: `SP-${Date.now()}-3`,
        name: 'Stainless Steel Cookware Set',
        price: 129.99,
        discountPrice: 99.99,
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500',
        category: 'Home & Kitchen',
        description: '10-piece professional cookware set with non-stick coating, dishwasher safe, and compatible with all stovetops including induction.',
        rating: 4.6,
        seller: 'Current Seller'
      },
      {
        id: `SP-${Date.now()}-4`,
        name: 'Ergonomic Office Chair',
        price: 249.99,
        discountPrice: 199.99,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500',
        category: 'Furniture',
        description: 'Comfortable ergonomic chair with lumbar support, adjustable height, and 360-degree swivel. Perfect for home office or workspace.',
        rating: 4.4,
        seller: 'Current Seller'
      },
      {
        id: `SP-${Date.now()}-5`,
        name: 'Portable Power Bank 20000mAh',
        price: 34.99,
        discountPrice: 24.99,
        image: 'https://images.unsplash.com/photo-1609091839311-d5363f40f66a?w=500',
        category: 'Electronics',
        description: 'High-capacity power bank with fast charging, dual USB ports, and LED indicator. Charges smartphones, tablets, and other devices multiple times.',
        rating: 4.3,
        seller: 'Current Seller'
      },
      {
        id: `SP-${Date.now()}-6`,
        name: 'Cotton Bedding Set',
        price: 89.99,
        discountPrice: 69.99,
        image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500',
        category: 'Home & Kitchen',
        description: 'Luxury 100% cotton bedding set includes comforter, sheets, and pillowcases. Soft, breathable, and machine washable. Available in multiple colors.',
        rating: 4.5,
        seller: 'Current Seller'
      }
    ];
    const updated = [...sampleProducts, ...products];
    setProducts(updated);
    saveProducts(updated);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Seller Products</Typography>
        {products.length === 0 && (
          <Button variant="outlined" color="secondary" onClick={seedSampleProducts}>
            Add Sample Products
          </Button>
        )}
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Product
            </Typography>
            <ComprehensiveProductForm 
              onSuccess={handleComprehensiveFormSuccess}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📦 Your Products ({products.length})
            </Typography>
            {products.length === 0 ? (
              <Box sx={{ 
                py: 4, 
                px: 2, 
                textAlign: 'center', 
                bgcolor: 'rgba(99, 102, 241, 0.05)',
                borderRadius: 2
              }}>
                <AlertIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1, opacity: 0.6 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No products added yet. Create your first product using the form on the left!
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={seedSampleProducts}
                >
                  📸 Add Sample Products
                </Button>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                      <TableCell>
                        <Stack>
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            {p.name}
                          </Typography>
                          {p.status && <Chip label={p.status} size="small" sx={{ width: 'fit-content', mt: 0.5 }} />}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={p.category} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${Number(p.price).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(p)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 600 }}>❌ Delete Product?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerProducts;
