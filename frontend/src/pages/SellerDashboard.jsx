import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  AddBox as AddProductIcon,
  Inventory2 as InventoryIcon,
  BarChart as AnalyticsIcon,
} from '@mui/icons-material';

const SellerDashboard = () => {
  const navigate = useNavigate();

  const actions = [
    { title: 'Create Product', icon: <AddProductIcon />, action: () => navigate('/seller/products') },
    { title: 'Manage Inventory', icon: <InventoryIcon />, action: () => navigate('/seller/products') },
    { title: 'Order Fulfillment', icon: <OrdersIcon />, action: () => navigate('/seller/fulfillment') },
    { title: 'Sales Analytics', icon: <AnalyticsIcon />, action: () => navigate('/seller/analytics') },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: (theme) => theme.palette.seller?.gradient || 'linear-gradient(135deg,#F3F4F6,#E5F6F5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4" fontWeight={700}>Seller Center</Typography>
        <Button variant="contained" onClick={() => navigate('/seller/products')}>
          Add Product
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ mb: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Listings</Typography>
            <Typography variant="h4">{(() => {
              try { return (JSON.parse(localStorage.getItem('seller_products')) || []).length; } catch { return 0; }
            })()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Units sold (local)</Typography>
            <Typography variant="h4">{(() => {
              try {
                const orders = JSON.parse(localStorage.getItem('orders_local')) || [];
                const ids = new Set(((JSON.parse(localStorage.getItem('seller_products')) || [])).map(p => p.id));
                let units = 0;
                orders.forEach(o => (o.items || []).forEach(it => { if (ids.has(it.id)) units += it.quantity || 0; }));
                return units;
              } catch { return 0; }
            })()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Revenue (local)</Typography>
            <Typography variant="h4">${(() => {
              try {
                const orders = JSON.parse(localStorage.getItem('orders_local')) || [];
                const ids = new Set(((JSON.parse(localStorage.getItem('seller_products')) || [])).map(p => p.id));
                let revenue = 0;
                orders.forEach(o => (o.items || []).forEach(it => { if (ids.has(it.id)) revenue += (it.price || 0) * (it.quantity || 0); }));
                return revenue.toFixed(2);
              } catch { return '0.00'; }
            })()}</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {actions.map((a) => (
          <Grid item xs={12} sm={6} md={3} key={a.title}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Stack spacing={2} alignItems="flex-start">
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  display: 'grid', placeItems: 'center',
                  bgcolor: 'primary.main', color: '#fff'
                }}>
                  {a.icon}
                </Box>
                <Typography variant="h6">{a.title}</Typography>
                <Button variant="outlined" onClick={a.action}>Open</Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Helpful Tips Section */}
      <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'rgba(76, 175, 80, 0.05)', border: '2px solid rgba(76, 175, 80, 0.2)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          💡 Seller Tips for Success
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ✅ Complete Your Listings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add clear product photos, detailed descriptions, and accurate pricing to attract more buyers.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ✅ Respond Quickly
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Answer customer questions promptly to build trust and increase sales.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ✅ Keep Stock Updated
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your inventory regularly to avoid selling out-of-stock items.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                ✅ Optimize Pricing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor market trends and adjust prices competitively to boost sales.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SellerDashboard;
