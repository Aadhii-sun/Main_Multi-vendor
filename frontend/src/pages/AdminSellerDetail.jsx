import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { getSellerById, getSellerAnalytics, approveSeller, rejectSeller } from '../services/admin';

const AdminSellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchSellerData();
  }, [id, dateRange]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      setError('');
      const [sellerData, analyticsData] = await Promise.all([
        getSellerById(id),
        getSellerAnalytics(id, dateRange !== 'all' ? { 
          startDate: getDateRange(dateRange).start,
          endDate: getDateRange(dateRange).end 
        } : {})
      ]);
      setSeller(sellerData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch seller data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    switch (range) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { start: null, end: null };
    }
    return { start: start.toISOString(), end: now.toISOString() };
  };

  const handleApprove = async () => {
    try {
      await approveSeller(id);
      fetchSellerData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve seller');
    }
  };

  const handleReject = async () => {
    if (window.confirm('Are you sure you want to reject this seller?')) {
      try {
        await rejectSeller(id);
        navigate('/admin/sellers');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to reject seller');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!seller) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Seller not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/sellers')}
          sx={{ mr: 2 }}
        >
          Back to Sellers
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Seller Account Details
        </Typography>
        {!seller.isSellerApproved && (
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            sx={{ mr: 1 }}
          >
            Approve Seller
          </Button>
        )}
        {seller.isSellerApproved && (
          <Button
            variant="outlined"
            color="error"
            onClick={handleReject}
          >
            Revoke Approval
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Seller Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{seller.name}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{seller.email}</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Approval Status
              </Typography>
              <Chip
                label={seller.isSellerApproved ? 'Approved' : 'Pending'}
                color={seller.isSellerApproved ? 'success' : 'warning'}
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Account Status
              </Typography>
              <Chip
                label={seller.isActive !== false ? 'Active' : 'Inactive'}
                color={seller.isActive !== false ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
            {seller.sellerProfile && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Business Name
                </Typography>
                <Typography variant="body1">{seller.sellerProfile.shopName || 'N/A'}</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Sales & Profit Analytics</Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                  <MenuItem value="1y">Last Year</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ mb: 3 }} />
            {analytics ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Revenue
                        </Typography>
                      </Box>
                      <Typography variant="h5" color="primary">
                        ${analytics.summary?.totalRevenue?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ShoppingCartIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Orders
                        </Typography>
                      </Box>
                      <Typography variant="h5" color="success.main">
                        {analytics.summary?.totalOrders || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {analytics.summary?.profit >= 0 ? (
                          <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                        ) : (
                          <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography variant="subtitle2" color="text.secondary">
                          Profit/Loss
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        color={analytics.summary?.profit >= 0 ? 'success.main' : 'error.main'}
                      >
                        ${analytics.summary?.profit?.toFixed(2) || '0.00'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Profit Margin
                        </Typography>
                      </Box>
                      <Typography variant="h5">
                        {analytics.summary?.profitMargin || '0.00'}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Typography color="text.secondary">No analytics data available</Typography>
            )}
          </Paper>

          {analytics && analytics.topProducts && analytics.topProducts.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.topProducts.map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell align="right">{product.quantity}</TableCell>
                      <TableCell align="right">${product.revenue?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}

          {analytics && analytics.recentOrders && analytics.recentOrders.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Orders
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.recentOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell align="right">${order.total?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            order.status === 'processing' ? 'info' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminSellerDetail;

