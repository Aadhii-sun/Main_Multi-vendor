import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Rating, Stack, Typography, TextField, IconButton, CircularProgress, Alert, Chip } from '@mui/material';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import PriceTag from '../components/Common/PriceTag.jsx';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { getProductById } from '../services/products';
import { useQuery } from '@tanstack/react-query';
import ProductReviews from '../components/Product/ProductReviews.jsx';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: wish, toggle } = useWishlist();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Fetch product from API
  // Try API first, fallback to localStorage if API fails
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        return await getProductById(id);
      } catch (apiError) {
        // Fallback to localStorage for backward compatibility
        const sellerProducts = (() => {
          try { return JSON.parse(localStorage.getItem('seller_products')) || []; } catch { return []; }
        })();
        const adminProducts = (() => {
          try { return JSON.parse(localStorage.getItem('admin_products')) || []; } catch { return []; }
        })();
        const allProducts = [...sellerProducts, ...adminProducts];
        const localProduct = allProducts.find((p) => String(p.id) === String(id));
        if (localProduct) {
          // Convert localStorage product format to API format
          return {
            _id: localProduct.id,
            name: localProduct.name,
            description: localProduct.description || '',
            price: localProduct.price,
            originalPrice: localProduct.discountPrice || localProduct.originalPrice,
            category: localProduct.category,
            subcategory: localProduct.subcategory,
            brand: localProduct.brand,
            images: localProduct.image ? [localProduct.image] : [],
            countInStock: localProduct.countInStock || 0,
            averageRating: localProduct.rating || 0,
            reviewCount: 0,
            status: 'active',
            tags: localProduct.tags || [],
            seller: localProduct.seller || { name: 'Unknown Seller' }
          };
        }
        throw apiError; // Re-throw if not found in localStorage either
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      // Add to recently viewed
      addRecentlyViewed({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        category: product.category
      });
    }
  }, [product]);

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.message || 'Product not found.'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  // Get product images (API returns array)
  const productImages = product.images && product.images.length > 0 ? product.images : ['/placeholder-image.jpg'];
  const mainImage = productImages[selectedImageIndex] || productImages[0];

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: productImages[0],
      countInStock: product.countInStock
    });
  };

  const isInWishlist = wish.some((w) => String(w.id) === String(product._id));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box
              component="img"
              src={mainImage}
              alt={product.name}
              sx={{
                width: '100%',
                height: '500px',
                objectFit: 'contain',
                borderRadius: 3,
                border: '1px solid #eee',
                backgroundColor: '#f5f5f5'
              }}
            />
            {productImages.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                {productImages.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 1.5,
                      border: selectedImageIndex === idx ? '2px solid' : '1px solid #eee',
                      borderColor: selectedImageIndex === idx ? 'primary.main' : '#eee',
                      cursor: 'pointer',
                      objectFit: 'cover',
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h4" sx={{ flex: 1 }}>{product.name}</Typography>
              <IconButton onClick={() => toggle({
                id: product._id,
                name: product.name,
                price: product.price,
                image: productImages[0]
              })}>
                {isInWishlist ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
              <Rating value={product.averageRating || 0} precision={0.1} readOnly />
              <Typography color="text.secondary">
                {product.averageRating ? product.averageRating.toFixed(1) : 'No ratings'}
              </Typography>
              {product.reviewCount > 0 && (
                <Typography color="text.secondary" variant="body2">
                  ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                </Typography>
              )}
            </Stack>

            <PriceTag price={Number(product.price)} discount={product.originalPrice} size="lg" />
            
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {product.category && (
                <Chip label={product.category} size="small" variant="outlined" />
              )}
              {product.brand && (
                <Chip label={`Brand: ${product.brand}`} size="small" variant="outlined" />
              )}
              {product.subcategory && (
                <Chip label={product.subcategory} size="small" variant="outlined" />
              )}
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Stock: {product.countInStock > 0 ? `${product.countInStock} available` : 'Out of stock'}
              </Typography>
              {product.sku && (
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
              )}
            </Box>

            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {product.description || 'No description provided.'}
            </Typography>

            {product.tags && product.tags.length > 0 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {product.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} size="small" />
                ))}
              </Stack>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={product.countInStock === 0 || product.status !== 'active'}
              onClick={handleAddToCart}
            >
              {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {product.seller && (
              <Typography variant="body2" color="text.secondary">
                Sold by: {product.seller.name || product.seller.email}
              </Typography>
            )}

          </Stack>
        </Grid>
      </Grid>

      {/* Product Reviews Section */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <ProductReviews
            productId={product._id}
            averageRating={product.averageRating || 0}
            reviewCount={product.reviewCount || 0}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;


