import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Rating,
  Stack,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Verified as VerifiedIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext.jsx';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import PriceTag from '../components/Common/PriceTag.jsx';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const VendorStore = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { items: wish, toggle } = useWishlist();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVendorData();
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      // Fetch vendor info and products from localStorage (since using local storage for now)
      const sellerProducts = JSON.parse(localStorage.getItem('seller_products') || '[]');
      const adminProducts = JSON.parse(localStorage.getItem('admin_products') || '[]');
      const allProducts = [...sellerProducts, ...adminProducts];
      
      // Find vendor products (match by seller ID or name)
      const vendorProducts = allProducts.filter(p => 
        (p.seller === vendorId || p.sellerId === vendorId || p.sellerName?.toLowerCase().includes(vendorId?.toLowerCase()))
      );

      if (vendorProducts.length > 0) {
        // Create vendor object from first product
        const firstProduct = vendorProducts[0];
        setVendor({
          id: vendorId,
          name: firstProduct.sellerName || 'Vendor Store',
          shopName: firstProduct.shopName || firstProduct.sellerName || 'Vendor Store',
          description: firstProduct.sellerDescription || 'Quality products from our store',
          rating: 4.5,
          totalReviews: 120,
          totalProducts: vendorProducts.length,
          verified: true,
        });
        setProducts(vendorProducts);
      } else {
        setError('Vendor not found');
      }
    } catch (err) {
      setError('Failed to load vendor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !vendor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Vendor not found'}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Vendor Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(241,85,185,0.1), rgba(100,32,170,0.1))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              fontSize: '3rem',
            }}
          >
            <StoreIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {vendor.shopName}
              </Typography>
              {vendor.verified && (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified"
                  color="success"
                  size="small"
                />
              )}
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {vendor.description}
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Rating value={vendor.rating} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({vendor.totalReviews} reviews)
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {vendor.totalProducts} Products
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Products Grid */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Products from {vendor.shopName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </Typography>
      </Box>

      {products.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No products available from this vendor.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={3} key={p.id || p._id} sx={{ display: 'flex', minHeight: '480px', maxHeight: '480px' }}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: '480px',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  m: 0
                }}
              >
                <Box
                  sx={{
                    height: '240px',
                    width: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    flexGrow: 0
                  }}
                >
                  <CardMedia
                    component="img"
                    image={p.image || p.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={p.name}
                    sx={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                </Box>
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Button size="small" onClick={() => toggle(p)} sx={{ minWidth: 0, p: 0.5 }}>
                    {wish.some((w) => (w.id || w._id) === (p.id || p._id)) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </Button>
                </Box>
                <CardContent
                  sx={{
                    height: '184px',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    overflow: 'hidden',
                    flexShrink: 0,
                    flexGrow: 0,
                    boxSizing: 'border-box'
                  }}
                >
                  <Stack spacing={1} sx={{ width: '100%', height: '100%' }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      title={p.name}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                        height: '2.4em',
                        width: '100%',
                        flexShrink: 0
                      }}
                    >
                      {p.name}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ height: '24px', flexShrink: 0 }}>
                      <Rating name="read-only" value={p.rating || p.averageRating || 0} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary">{p.rating || p.averageRating || 'No ratings'}</Typography>
                    </Stack>
                    <Chip label={p.category} size="small" sx={{ width: 'fit-content', height: '24px', flexShrink: 0 }} />
                    <Box sx={{ flexShrink: 0, mt: 'auto' }}>
                      <PriceTag price={p.price} discount={p.discountPrice || p.originalPrice} />
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions
                  sx={{
                    p: 2,
                    pt: 1.5,
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    height: '56px',
                    flexShrink: 0,
                    flexGrow: 0,
                    boxSizing: 'border-box',
                    m: 0
                  }}
                >
                  <Button size="small" onClick={() => navigate(`/products/${p.id || p._id}`)}>Details</Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => addItem({ id: p.id || p._id, name: p.name, price: p.discountPrice || p.originalPrice || p.price, image: p.image || p.images?.[0] })}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default VendorStore;



