import React, { useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Inventory2,
} from '@mui/icons-material';
import { getLocalOrders } from '../utils/localOrders';

const SellerAnalytics = () => {
  const orders = getLocalOrders();
  const sellerProductIds = useMemo(() => {
    try {
      return new Set((JSON.parse(localStorage.getItem('seller_products')) || []).map(p => p.id));
    } catch {
      return new Set();
    }
  }, []);

  const analytics = useMemo(() => {
    const sellerOrders = orders
      .map(order => ({
        ...order,
        sellerItems: (order.items || []).filter(item => sellerProductIds.has(item.id)),
      }))
      .filter(order => order.sellerItems.length > 0);

    const totalRevenue = sellerOrders.reduce((sum, order) => {
      return sum + order.sellerItems.reduce((itemSum, item) => 
        itemSum + (item.price || 0) * (item.quantity || 1), 0
      );
    }, 0);

    const totalUnits = sellerOrders.reduce((sum, order) => {
      return sum + order.sellerItems.reduce((itemSum, item) => 
        itemSum + (item.quantity || 1), 0
      );
    }, 0);

    const totalOrders = sellerOrders.length;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Monthly breakdown (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = sellerOrders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt || now);
        return orderDate.getMonth() === month.getMonth() && 
               orderDate.getFullYear() === month.getFullYear();
      });
      const monthRevenue = monthOrders.reduce((sum, order) => {
        return sum + order.sellerItems.reduce((itemSum, item) => 
          itemSum + (item.price || 0) * (item.quantity || 1), 0
        );
      }, 0);
      monthlyData.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length,
      });
    }

    return {
      totalRevenue,
      totalUnits,
      totalOrders,
      avgOrderValue,
      monthlyData,
    };
  }, [orders, sellerProductIds]);

  const KPI_CARDS = [
    {
      title: 'Total Revenue',
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#4caf50',
    },
    {
      title: 'Total Orders',
      value: analytics.totalOrders,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#2196f3',
    },
    {
      title: 'Units Sold',
      value: analytics.totalUnits,
      icon: <Inventory2 sx={{ fontSize: 40 }} />,
      color: '#ff9800',
    },
    {
      title: 'Avg Order Value',
      value: `$${analytics.avgOrderValue.toFixed(2)}`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Sales Analytics</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {KPI_CARDS.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${kpi.color}15, ${kpi.color}05)`,
                border: `1px solid ${kpi.color}30`,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
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
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Monthly Revenue</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {analytics.monthlyData.map((data, idx) => (
                <Box key={idx}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{data.month}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${data.revenue.toFixed(2)} ({data.orders} orders)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(100, (data.revenue / Math.max(...analytics.monthlyData.map(d => d.revenue), 1)) * 100)}%`,
                        bgcolor: 'primary.main',
                        transition: 'width 0.3s',
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Performance Summary</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Conversion Rate</Typography>
                <Typography variant="h6">
                  {analytics.totalOrders > 0 
                    ? ((analytics.totalOrders / Math.max(analytics.totalOrders, 1)) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Best Month</Typography>
                <Typography variant="h6">
                  {analytics.monthlyData.length > 0
                    ? analytics.monthlyData.reduce((max, d) => d.revenue > max.revenue ? d : max, analytics.monthlyData[0]).month
                    : 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Products</Typography>
                <Typography variant="h6">{sellerProductIds.size}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SellerAnalytics;








