import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Typography,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import ChatFab from '../components/Common/ChatFab.jsx';
import PromotionalBanner from '../components/Common/PromotionalBanner.jsx';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { addItem } = useCart() || { addItem: () => {} };
  const { currentUser } = useAuth() || { currentUser: null };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        pb: { xs: 8, md: 12 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: 360,
          height: 360,
          background: theme.palette.brand?.lavender,
          borderRadius: '50%',
          filter: 'blur(60px)',
          opacity: 0.5,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-20%',
          width: 420,
          height: 420,
          background: theme.palette.brand?.magenta,
          borderRadius: '40%',
          filter: 'blur(80px)',
          opacity: 0.18,
        }}
      />

      {/* Promotional Banner Carousel */}
      <PromotionalBanner />

      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 8 } }}>
        {/* Quick Features / Onboarding Section */}
        <Box sx={{ mb: { xs: 4, md: 6 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate('/products')}
              >
                <ShoppingBagIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🛍️ Shop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Browse all products
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate('/seller-center')}
              >
                <StorefrontIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🏪 Sell
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Become a seller
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate('/orders')}
              >
                <LocalShippingIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  📦 Orders
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track orders
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate('/cart')}
              >
                <ShoppingBagIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  🛒 Cart
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  View cart items
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 2, md: 4 } }} />

        <Box sx={{ mt: { xs: 2, md: 4 } }}>
          {/* Dynamic category shelves */}
          <CategoryShelves />
          {/* Recently viewed */}
          <RecentlyViewedShelf />
        </Box>
      </Container>

      {/* Floating chat assist button */}
      <ChatFab />
    </Box>
  );
};

export default Home;


// Component to display all categories with shelves
const CategoryShelves = () => {
  const navigate = useNavigate();
  
  // Load all products from localStorage
  const allProducts = React.useMemo(() => {
    try {
      const seller = localStorage.getItem('seller_products');
      const admin = localStorage.getItem('admin_products');
      const sellerProds = seller ? JSON.parse(seller) : [];
      const adminProds = admin ? JSON.parse(admin) : [];
      return [...sellerProds, ...adminProds].filter(p => p && p.name && p.category);
    } catch (e) {
      console.error('Error loading products:', e);
      return [];
    }
  }, []);
  
  // Group by category
  const groupedByCategory = React.useMemo(() => {
    const groups = {};
    allProducts.forEach((product) => {
      const cat = product.category || 'Other';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(product);
    });
    return groups;
  }, [allProducts]);
  
  const categories = Object.keys(groupedByCategory).sort();
  
  if (allProducts.length === 0 || categories.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No products available yet. Check back soon!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {categories.map((category) => (
        <Shelf 
          key={category}
          title={`📂 ${category}`}
          products={groupedByCategory[category].slice(0, 4)}
          onSeeAll={() => navigate(`/products?category=${category}`)}
        />
      ))}
    </Box>
  );
};


// Simple product shelf component
const Shelf = ({ title, products, onSeeAll }) => {
  const theme = useTheme();
  const { addItem } = useCart() || { addItem: () => {} };
  const navigate = useNavigate();
  
  // Use passed products or fetch from catalog (for backward compatibility)
  const items = products || (() => {
    const sellerProducts = (() => {
      try {
        const raw = localStorage.getItem('seller_products');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const adminProducts = (() => {
      try {
        const raw = localStorage.getItem('admin_products');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();
    const catalog = [...sellerProducts, ...adminProducts];
    return catalog.slice(0, 4);
  })();

  return (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          {title}
        </Typography>
        <Button 
          size="small" 
          onClick={onSeeAll} 
          color="secondary"
          sx={{
            color: '#667eea',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            '&:hover': { 
              background: 'rgba(102, 126, 234, 0.1)',
              transform: 'translateX(4px)'
            }
          }}
        >
          See all →
        </Button>
      </Stack>
      <Grid container spacing={3}>
        {items.map((p) => (
          <Grid key={p.id} xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '480px', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-6px)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }
            }}>
              <Box sx={{ 
                height: '240px', 
                width: '100%', 
                overflow: 'hidden', 
                position: 'relative',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
              }}>
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
                    left: 0,
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }} 
                />
              </Box>
              <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', p: 2, minHeight: 0, overflow: 'hidden' }}>
                <Typography 
                  variant="subtitle1" 
                  title={p.name} 
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                    minHeight: '2.4em',
                    maxHeight: '2.4em',
                    fontWeight: 600,
                    color: '#1a1a1a'
                  }}
                >
                  {p.name}
                </Typography>
                <Box sx={{ flexGrow: 1, flexShrink: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    ₹{p.price.toFixed(2)}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  sx={{ 
                    mt: 1,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(34, 197, 94, 0.3)'
                    }
                  }} 
                  onClick={() => addItem(p)} 
                  fullWidth
                >
                  🛒 Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}


const RecentlyViewedShelf = () => {
  const items = getRecentlyViewed();
  if (!items.length) return null;
  const { addItem } = useCart() || { addItem: () => {} };
  return (
    <Box sx={{ mt: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}
        >
          👀 Recently viewed
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        {items.slice(0, 8).map((p) => (
          <Grid key={p.id} xs={12} sm={6} md={3}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              height: '480px', 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: 'translateY(-6px)',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }
            }}>
              <Box sx={{ 
                height: '240px', 
                width: '100%', 
                overflow: 'hidden', 
                position: 'relative',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)'
              }}>
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
                    left: 0,
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }} 
                />
              </Box>
              <CardContent sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', p: 2, minHeight: 0, overflow: 'hidden' }}>
                <Typography 
                  variant="subtitle1" 
                  title={p.name} 
                  sx={{ 
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                    minHeight: '2.4em',
                    maxHeight: '2.4em',
                    fontWeight: 600,
                    color: '#1a1a1a'
                  }}
                >
                  {p.name}
                </Typography>
                <Box sx={{ flexGrow: 1, flexShrink: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    ₹{p.price.toFixed(2)}
                  </Typography>
                </Box>
                <Button 
                  size="small" 
                  variant="contained" 
                  sx={{ 
                    mt: 1,
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(34, 197, 94, 0.3)'
                    }
                  }} 
                  onClick={() => addItem(p)} 
                  fullWidth
                >
                  🛒 Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};