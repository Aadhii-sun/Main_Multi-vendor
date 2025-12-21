import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import { getLocalOrders } from '../utils/localOrders';

const AdminOrders = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = getLocalOrders();

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(o => (o.status || 'Processing').toLowerCase() === statusFilter.toLowerCase());
  }, [orders, statusFilter]);

  const updateOrderStatus = (orderId, newStatus) => {
    try {
      const allOrders = getLocalOrders();
      const updated = allOrders.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      );
      localStorage.setItem('orders_local', JSON.stringify(updated));
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const statusColor = (status) => {
    const s = (status || 'Processing').toLowerCase();
    if (s === 'delivered') return 'success';
    if (s === 'cancelled') return 'error';
    if (s === 'processing') return 'info';
    if (s === 'shipped') return 'warning';
    return 'default';
  };

  const totalRevenue = orders.reduce((sum, o) => {
    const total = typeof o.total === 'string' ? parseFloat(o.total.replace('$', '')) : o.totalPrice || 0;
    return sum + total;
  }, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Order Management</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
            <Typography variant="h5">{orders.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 150 }}>
            <Typography variant="subtitle2" color="text.secondary">Total Revenue</Typography>
            <Typography variant="h5">${totalRevenue.toFixed(2)}</Typography>
          </Paper>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Orders</MenuItem>
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
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id?.slice(-8) || order.id}</TableCell>
                  <TableCell>{order.date || new Date().toLocaleDateString()}</TableCell>
                  <TableCell>
                    {order.shipping?.name || 'N/A'}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {order.shipping?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.items?.length || 0} item(s)
                  </TableCell>
                  <TableCell>
                    {typeof order.total === 'string' ? order.total : `$${(order.totalPrice || 0).toFixed(2)}`}
                  </TableCell>
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
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={order.status || 'Processing'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <MenuItem value="Processing">Processing</MenuItem>
                          <MenuItem value="Shipped">Shipped</MenuItem>
                          <MenuItem value="Delivered">Delivered</MenuItem>
                          <MenuItem value="Cancelled">Cancelled</MenuItem>
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
            <DialogTitle>Order #{selectedOrder.id?.slice(-8) || selectedOrder.id}</DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                  <Typography>{selectedOrder.date || new Date().toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedOrder.status || 'Processing'} 
                    color={statusColor(selectedOrder.status)}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Items</Typography>
                  {selectedOrder.items?.map((item, idx) => (
                    <Box key={idx} sx={{ mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography>{item.name} x {item.quantity}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${(item.price || 0).toFixed(2)} each
                      </Typography>
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
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                  <Typography variant="h6">
                    {typeof selectedOrder.total === 'string' ? selectedOrder.total : `$${(selectedOrder.totalPrice || 0).toFixed(2)}`}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedOrder.status || 'Processing'}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                >
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
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






