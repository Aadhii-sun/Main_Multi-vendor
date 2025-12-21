import React from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import { useOrders } from '../hooks/useOrders';
import { useNavigate } from 'react-router-dom';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const statusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'processing':
      return 'info';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Orders = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useOrders();
  const navigate = useNavigate();
  const orders = Array.isArray(data) ? data : [];

  const showPlaceholder = !isLoading && !isError && orders.length === 0;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Orders</Typography>
        <Button variant="outlined" onClick={() => refetch()} disabled={isLoading || isRefetching}>
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.message || error?.message || 'Failed to load orders.'}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, minHeight: 200 }}>
        {isLoading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading your orders...</Typography>
          </Box>
        ) : showPlaceholder ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <ShoppingBagIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📦 No Orders Yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Browse products from our vendors and place your first order to see it here.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" onClick={() => navigate('/products')}>
                🛍️ Start Shopping
              </Button>
              <Button variant="outlined" onClick={() => navigate('/cart')}>
                View Cart
              </Button>
            </Stack>
          </Box>
        ) : (
          <List disablePadding>
            {orders.map((order, idx) => {
              const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : order.id;
              const placedOn = order.createdAt
                ? new Date(order.createdAt).toLocaleDateString()
                : order.date;
              const total = typeof order.totalPrice === 'number'
                ? `$${order.totalPrice.toFixed(2)}`
                : order.total;
              const status = order.status || 'Processing';

              return (
                <React.Fragment key={order._id || order.id || idx}>
                  <ListItem sx={{ px: 3, py: 2, alignItems: 'flex-start', cursor: 'pointer' }} onClick={() => navigate(`/orders/${order._id || order.id}`)}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">Order #{orderId}</Typography>
                          <Chip label={status} color={statusColor(status)} />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                            Placed on {placedOn} · Total {total}
                          </Typography>
                          {order.trackingNumber && (
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                              Tracking: {order.trackingNumber}
                            </Typography>
                          )}
                          {order.estimatedDelivery && (
                            <Typography variant="body2" color="text.secondary">
                              Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < orders.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Orders;

