import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  Box,
  Typography,
  Button,
  Container,
  Avatar,
  Grid,
  Card,
  CardContent,
  useTheme,
  Stack,
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import ProductCarousel from '../Common/ProductCarousel.jsx';
import { getRecentlyViewed } from '../../utils/recentlyViewed';
import { useCart } from '../../contexts/CartContext.jsx';
import {
  ShoppingCart as CartIcon,
  History as OrderHistoryIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  FavoriteBorder as WishlistIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const { addItem } = useCart() || { addItem: () => {} };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const features = [
    {
      title: 'Shop Products',
      description: 'Browse categories, apply filters, and discover deals',
      icon: CartIcon,
      action: () => navigate('/products'),
      accent: '#E5F5F1',
    },
    {
      title: 'My Orders',
      description: 'Track dispatches, deliveries and returns',
      icon: OrderHistoryIcon,
      action: () => navigate('/orders'),
      accent: '#FFE4F7',
    },
    {
      title: 'Wishlist',
      description: 'Save items you love and buy later',
      icon: WishlistIcon,
      action: () => navigate('/wishlist'),
      accent: theme.palette.brand?.lavender,
    },
    {
      title: 'Address Book',
      description: 'Manage delivery addresses for fast checkout',
      icon: ProfileIcon,
      action: () => navigate('/addresses'),
      accent: '#F3F4F6',
    },
  ];

  const quickStats = [
    { label: 'Active Orders', value: '3', icon: <CartIcon /> },
    { label: 'Wishlist Items', value: '7', icon: <WishlistIcon /> },
    { label: 'Returns in Progress', value: '0', icon: <PlayIcon /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Slider just below header */}
      <ProductCarousel title="Featured for you" />

      <Box
        sx={{
          position: 'relative',
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(241,85,185,0.14), rgba(100,32,170,0.1))',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 4,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at 12% 20%, rgba(255,255,255,0.7), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.45), transparent 55%)',
          }}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                bgcolor: theme.palette.secondary.main,
                fontSize: '2rem',
                fontWeight: 600,
              }}
            >
              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontFamily: '"Baloo 2", "Poppins", sans-serif', fontWeight: 700 }}>
                Welcome back, {currentUser?.name || 'Creator'}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {currentUser?.email}
              </Typography>
              <Chip label="Loyalty Member" color="secondary" variant="outlined" sx={{ mt: 1, fontWeight: 600 }} />
            </Box>
          </Stack>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              borderWidth: 2,
              px: 3,
              py: 1,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Logout
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default UserDashboard;
