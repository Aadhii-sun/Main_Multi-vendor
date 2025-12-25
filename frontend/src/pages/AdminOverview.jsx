import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Stack, Typography, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Inventory2,
  People,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
import { getDashboardStats, getAllOrders, getAllProducts } from '../services/admin';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const dashboardData = await getDashboardStats();
      setStats(dashboardData);

      // Fetch recent orders
      const ordersResponse = await getAllOrders();
      const ordersList = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse.orders || []);
      setRecentOrders(ordersList.slice(0, 5));

      // Fetch pending products
      const productsResponse = await getAllProducts({ limit: 1000, allStatus: true });
      const productsList = productsResponse.products || productsResponse || [];
      const pending = productsList.filter(p => 
        p.status === 'pending' || !p.status || p.status === 'inactive'
      );
      setPendingProducts(pending.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const overview = stats?.overview || {};
  const ordersData = stats?.orders || {};

  const KPI_CARDS = [
    {
      title: 'Total Products',
      value: overview.totalProducts || 0,
      icon: <Inventory2 sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      action: () => navigate('/admin/products'),
      actionLabel: 'Manage Products',
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders || 0,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => navigate('/admin/orders'),
      actionLabel: 'View Orders',
    },
    {
      title: 'Total Revenue',
      value: `$${(overview.totalRevenue || 0).toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Pending Approvals',
      value: pendingProducts.length,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#f44336',
      action: () => navigate('/admin/products'),
      actionLabel: 'Review',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Admin Dashboard</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => navigate('/admin/products')}>
            Manage Products
          </Button>
          <Button variant="outlined" onClick={() => navigate('/admin/orders')}>
            Manage Orders
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {KPI_CARDS.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05)`,
                border: `1px solid ${kpi.color}30`,
                height: '100%',
                cursor: kpi.action ? 'pointer' : 'default',
                '&:hover': kpi.action ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  transition: 'all 0.3s',
                } : {},
              }}
              onClick={kpi.action}
            >
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: kpi.color, opacity: 0.8 }}>
                    {kpi.icon}
                  </Box>
                </Box>
                {kpi.action && (
                  <Button size="small" variant="outlined" sx={{ mt: 1 }}>
                    {kpi.actionLabel}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Orders</Typography>
              <Button size="small" onClick={() => navigate('/admin/orders')}>
                View All
              </Button>
            </Box>
            <Stack spacing={2}>
              {recentOrders.length === 0 ? (
                <Typography color="text.secondary">No orders yet</Typography>
              ) : (
                recentOrders.map((order) => (
                  <Box
                    key={order._id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    }}
                    onClick={() => navigate('/admin/orders')}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2">
                          Order #{order._id?.slice(-8) || order._id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.createdAt 
                            ? new Date(order.createdAt).toLocaleDateString() 
                            : new Date().toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={order.status || 'pending'}
                        size="small"
                        color={
                          (order.status || '').toLowerCase() === 'delivered' ? 'success' :
                          (order.status || '').toLowerCase() === 'cancelled' ? 'error' : 'info'
                        }
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      ${(order.totalPrice || 0).toFixed(2)}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Pending Product Approvals</Typography>
              <Button size="small" onClick={() => navigate('/admin/products')}>
                Review All
              </Button>
            </Box>
            <Stack spacing={2}>
              {pendingProducts.length === 0 ? (
                <Typography color="text.secondary">No pending approvals</Typography>
              ) : (
                pendingProducts.map((product) => (
                  <Box
                    key={product._id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(0,0,0,0.02)',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    }}
                    onClick={() => navigate('/admin/products')}
                  >
                    <Typography variant="subtitle2">{product.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${Number(product.price || 0).toFixed(2)} · {product.category || 'Uncategorized'}
                    </Typography>
                    {product.seller && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Seller: {product.seller.name || product.seller.email || 'N/A'}
                      </Typography>
                    )}
                    <Chip label="Pending" size="small" color="warning" sx={{ mt: 1 }} />
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminOverview;
