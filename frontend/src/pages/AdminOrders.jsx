import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Chip,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Refresh, Cancel as CancelIcon } from '@mui/icons-material';
import { getAllOrders, updateOrderStatus, cancelOrder } from '../services/admin';

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrders();
      const ordersList = Array.isArray(response) ? response : (response.orders || []);
      setOrders(ordersList);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh orders
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(orderId);
      await cancelOrder(orderId);
      await fetchOrders(); // Refresh orders
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(o => (o.status || 'pending').toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const statusColor = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'delivered') return 'success';
    if (s === 'cancelled') return 'error';
    if (s === 'processing' || s === 'confirmed') return 'info';
    if (s === 'shipped') return 'warning';
    return 'default';
  };

  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

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
          📋 Order Management
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
            <Typography variant="h5">{orders.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h5">${totalRevenue.toFixed(2)}</Typography>
          </Paper>
          <IconButton onClick={fetchOrders} color="primary">
            <Refresh />
          </IconButton>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>#{order._id?.slice(-8) || order._id}</TableCell>
                  <TableCell>
                    {order.createdAt 
                      ? new Date(order.createdAt).toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {order.user?.name || order.shippingAddress?.name || 'N/A'}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {order.user?.email || order.shippingAddress?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.orderItems?.length || 0} item(s)
                  </TableCell>
                  <TableCell>
                    ${(order.totalPrice || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status || 'pending'} 
                      color={statusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button 
                        size="small" 
                        onClick={() => setSelectedOrder(order)}
                        variant="outlined"
                      >
                        View
                      </Button>
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={cancelling === order._id ? <CircularProgress size={16} /> : <CancelIcon />}
                          onClick={() => handleCancel(order._id)}
                          disabled={cancelling === order._id}
                        >
                          Cancel
                        </Button>
                      )}
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updating === order._id}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="confirmed">Confirmed</MenuItem>
                          <MenuItem value="processing">Processing</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="delivered">Delivered</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>Order #{selectedOrder._id?.slice(-8) || selectedOrder._id}</DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                  <Typography>
                    {selectedOrder.createdAt 
                      ? new Date(selectedOrder.createdAt).toLocaleString() 
                      : new Date().toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedOrder.status || 'pending'} 
                    color={statusColor(selectedOrder.status)}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Customer</Typography>
                  <Typography>
                    {selectedOrder.user?.name || selectedOrder.shippingAddress?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.user?.email || selectedOrder.shippingAddress?.email || ''}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Items</Typography>
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography variant="body1">
                        {item.product?.name || item.name || 'Product'} x {item.qty || item.quantity || 1}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${(item.price || 0).toFixed(2)} each
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Shipping Address</Typography>
                  {selectedOrder.shippingAddress ? (
                    <Typography>
                      {selectedOrder.shippingAddress.name || ''}<br />
                      {selectedOrder.shippingAddress.line1 || ''}<br />
                      {selectedOrder.shippingAddress.city || ''}, {selectedOrder.shippingAddress.state || ''} {selectedOrder.shippingAddress.postal_code || ''}<br />
                      {selectedOrder.shippingAddress.country || ''}
                    </Typography>
                  ) : (
                    <Typography>No shipping address provided</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                  <Typography variant="h6">
                    ${(selectedOrder.totalPrice || 0).toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={cancelling === selectedOrder._id ? <CircularProgress size={16} /> : <CancelIcon />}
                  onClick={() => {
                    handleCancel(selectedOrder._id);
                  }}
                  disabled={cancelling === selectedOrder._id}
                >
                  Cancel Order
                </Button>
              )}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedOrder.status || 'pending'}
                  onChange={(e) => {
                    handleStatusUpdate(selectedOrder._id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                  disabled={updating === selectedOrder._id}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminOrders;
