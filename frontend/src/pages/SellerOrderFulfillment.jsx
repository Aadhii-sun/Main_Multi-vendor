import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { LocalShipping, CheckCircle } from '@mui/icons-material';
import { getLocalOrders } from '../utils/localOrders';

const SellerOrderFulfillment = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const orders = getLocalOrders();
  const sellerProductIds = useMemo(() => {
    try {
      return new Set((JSON.parse(localStorage.getItem('seller_products')) || []).map(p => p.id));
    } catch {
      return new Set();
    }
  }, []);

  // Filter orders that contain seller's products
  const sellerOrders = useMemo(() => {
    return orders
      .map(order => ({
        ...order,
        sellerItems: (order.items || []).filter(item => sellerProductIds.has(item.id)),
        sellerTotal: (order.items || [])
          .filter(item => sellerProductIds.has(item.id))
          .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
      }))
      .filter(order => order.sellerItems.length > 0);
  }, [orders, sellerProductIds]);

  const updateOrderStatus = (orderId, newStatus, tracking = null) => {
    try {
      const allOrders = getLocalOrders();
      const updated = allOrders.map(o => {
        if (o.id === orderId) {
          const updated = { ...o, status: newStatus };
          if (tracking) updated.trackingNumber = tracking;
          return updated;
        }
        return o;
      });
      localStorage.setItem('orders_local', JSON.stringify(updated));
      setSelectedOrder(null);
      setTrackingNumber('');
      window.location.reload();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleShipOrder = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    updateOrderStatus(selectedOrder.id, 'Shipped', trackingNumber);
  };

  const statusColor = (status) => {
    const s = (status || 'Processing').toLowerCase();
    if (s === 'delivered') return 'success';
    if (s === 'cancelled') return 'error';
    if (s === 'shipped') return 'warning';
    return 'info';
  };

  const totalRevenue = sellerOrders.reduce((sum, o) => sum + (o.sellerTotal || 0), 0);
  const pendingOrders = sellerOrders.filter(o => (o.status || 'Processing').toLowerCase() === 'processing').length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Order Fulfillment</Typography>
        <Stack direction="row" spacing={2}>
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Pending Orders</Typography>
            <Typography variant="h5">{pendingOrders}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h5">${totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Stack>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sellerOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    No orders for your products yet
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sellerOrders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id?.slice(-8) || order.id}</TableCell>
                  <TableCell>{order.date || new Date().toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.sellerItems.map((item, idx) => (
                      <Typography key={idx} variant="body2">
                        {item.name} x {item.quantity}
                      </Typography>
                    ))}
                  </TableCell>
                  <TableCell>${order.sellerTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status || 'Processing'} 
                      color={statusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => setSelectedOrder(order)}>
                        View
                      </Button>
                      {(order.status || 'Processing').toLowerCase() === 'processing' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<LocalShipping />}
                          onClick={() => setSelectedOrder(order)}
                        >
                          Ship
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ship Order Dialog */}
      <Dialog open={!!selectedOrder} onClose={() => { setSelectedOrder(null); setTrackingNumber(''); }} maxWidth="sm" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>Ship Order #{selectedOrder.id?.slice(-8) || selectedOrder.id}</DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Items to Ship</Typography>
                  {selectedOrder.sellerItems?.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography>{item.name} x {item.quantity}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Shipping Address</Typography>
                  <Typography>
                    {selectedOrder.shipping?.name || 'N/A'}<br />
                    {selectedOrder.shipping?.line1 || ''}<br />
                    {selectedOrder.shipping?.city || ''}, {selectedOrder.shipping?.country || ''}
                  </Typography>
                </Box>
                <TextField
                  label="Tracking Number"
                  fullWidth
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  required
                />
                <Typography variant="caption" color="text.secondary">
                  Once you mark this order as shipped, the customer will be notified and can track their package.
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { setSelectedOrder(null); setTrackingNumber(''); }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={handleShipOrder}
                disabled={!trackingNumber.trim()}
              >
                Mark as Shipped
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default SellerOrderFulfillment;








