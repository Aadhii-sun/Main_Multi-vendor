import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Divider, 
  Button,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, updateOrderStatus } from '../services/orders';
import { useAuth } from '../contexts/AuthContext';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { OrderCardSkeleton } from '../components/Common/SkeletonLoader';

const SellerOrders = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: getMyOrders,
    enabled: !!currentUser,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, notes }) => updateOrderStatus(orderId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['seller-orders']);
      queryClient.invalidateQueries(['orders', 'current-user']);
      setStatusDialogOpen(false);
      setSelectedOrder(null);
      setTrackingNumber('');
    },
  });

  // Filter orders that contain products from this seller
  const sellerOrders = React.useMemo(() => {
    if (!orders || !currentUser) return [];
    
    return orders.filter(order => {
      // Check if any order item belongs to this seller
      return order.orderItems?.some(item => 
        item.product?.seller?._id === currentUser._id || 
        item.product?.seller === currentUser._id ||
        item.seller === currentUser._id
      );
    });
  }, [orders, currentUser]);

  const handleStatusUpdate = (order, newStatus) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedOrder) return;

    const notes = trackingNumber 
      ? `Tracking number: ${trackingNumber}` 
      : `Status updated to ${selectedOrder.newStatus}`;

    updateStatusMutation.mutate({
      orderId: selectedOrder._id,
      status: selectedOrder.newStatus,
      notes
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'default',
      confirmed: 'info',
      processing: 'warning',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const canUpdateStatus = (order) => {
    const status = order.status?.toLowerCase();
    return status === 'confirmed' || status === 'processing';
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h4" gutterBottom>Seller Orders</Typography>
        <Stack spacing={2}>
          {[1, 2, 3].map(i => <OrderCardSkeleton key={i} />)}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Alert severity="error">
          {error.response?.data?.message || 'Failed to load orders'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Seller Orders</Typography>
      
      {sellerOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No orders for your products yet.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <List disablePadding>
            {sellerOrders.map((order, idx) => (
              <React.Fragment key={order._id || order.id}>
                <ListItem sx={{ px: 3, py: 2, alignItems: 'flex-start', flexDirection: 'column' }}>
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6">Order #{order._id?.slice(-8).toUpperCase() || order.id}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Total: ${order.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={order.status || 'Processing'} 
                      color={getStatusColor(order.status)}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Items:</Typography>
                    {order.orderItems?.map((item, itemIdx) => (
                      <Typography key={itemIdx} variant="body2" sx={{ ml: 2 }}>
                        {item.product?.name || item.name} x {item.qty || item.quantity} — ${(item.price * (item.qty || item.quantity)).toFixed(2)}
                      </Typography>
                    ))}
                  </Box>

                  {canUpdateStatus(order) && (
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LocalShippingIcon />}
                        onClick={() => {
                          setSelectedOrder({ ...order, newStatus: 'shipped' });
                          setStatusDialogOpen(true);
                        }}
                      >
                        Mark as Shipped
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => {
                          setSelectedOrder({ ...order, newStatus: 'delivered' });
                          setStatusDialogOpen(true);
                        }}
                      >
                        Mark as Delivered
                      </Button>
                    </Stack>
                  )}

                  {order.trackingNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tracking: {order.trackingNumber}
                    </Typography>
                  )}
                </ListItem>
                {idx < sellerOrders.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>
          Update Order Status to {selectedOrder?.newStatus?.toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Tracking Number (Optional)"
            fullWidth
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Enter tracking number if available"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmStatusUpdate}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerOrders;
