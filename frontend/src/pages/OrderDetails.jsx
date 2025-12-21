import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Stack,
  Button,
  Paper,
  Chip,
  Divider,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Inventory2,
  Cancel,
  Payment,
  Inventory,
} from '@mui/icons-material';
import { getOrderById } from '../services/admin';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const orderData = await getOrderById(id);
      setOrder(orderData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Order not found'}</Alert>
        <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
      </Container>
    );
  }

  const status = (order.status || 'pending').toLowerCase();
  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = status === 'delivered' ? 4 : 
                      status === 'shipped' ? 3 : 
                      status === 'processing' ? 2 : 
                      status === 'confirmed' ? 1 : 0;

  const statusColor = (s) => {
    if (s === 'delivered') return 'success';
    if (s === 'cancelled') return 'error';
    if (s === 'shipped') return 'warning';
    if (s === 'processing') return 'info';
    return 'default';
  };

  const total = order.totalPrice || 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Order #{order._id?.slice(-8).toUpperCase() || order.id}</Typography>
          <Typography color="text.secondary">
            Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
          </Typography>
        </Box>
        <Chip
          label={order.status || 'Processing'}
          color={statusColor(status)}
          size="large"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Order Status</Typography>
            <Stepper activeStep={currentStep} alternativeLabel sx={{ mt: 3 }}>
              {statusSteps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconComponent={
                      index <= currentStep && status !== 'cancelled'
                        ? CheckCircle
                        : Inventory2
                    }
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {order.trackingNumber && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Tracking Number</Typography>
                <Typography variant="h6">{order.trackingNumber}</Typography>
                {order.estimatedDelivery && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </Typography>
                )}
                <Button
                  size="small"
                  startIcon={<LocalShipping />}
                  sx={{ mt: 1 }}
                  onClick={() => window.open(`https://www.17track.net/en/track#nums=${order.trackingNumber}`, '_blank')}
                >
                  Track Package
                </Button>
              </Box>
            )}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Status History</Typography>
                <Box sx={{ position: 'relative', pl: 4 }}>
                  {order.statusHistory.map((history, idx) => (
                    <Box key={idx} sx={{ position: 'relative', pb: 2 }}>
                      {idx < order.statusHistory.length - 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -28,
                            top: 40,
                            bottom: -8,
                            width: 2,
                            bgcolor: 'divider',
                          }}
                        />
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: statusColor(history.status) === 'success' ? 'success.main' :
                                     statusColor(history.status) === 'error' ? 'error.main' :
                                     statusColor(history.status) === 'warning' ? 'warning.main' : 'primary.main',
                            color: 'white',
                            position: 'absolute',
                            left: -48,
                            top: 0,
                            zIndex: 1,
                          }}
                        >
                          {history.status === 'delivered' ? <CheckCircle /> : <Inventory />}
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {history.status.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(history.changedAt).toLocaleString()}
                          </Typography>
                          {history.notes && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {history.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Order Items</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {order.orderItems?.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Box
                    component="img"
                    src={item.product?.image?.[0] || item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.product?.name || 'Product'}
                    sx={{ width: 80, height: 80, borderRadius: 1, objectFit: 'cover' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{item.product?.name || 'Product'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.qty}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price: ${(item.price || 0).toFixed(2)} each
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h5">${total.toFixed(2)}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Shipping Address</Typography>
            {order.shippingAddress ? (
              <>
                <Typography>{order.shippingAddress.street || ''}</Typography>
                <Typography>
                  {order.shippingAddress.city || ''}, {order.shippingAddress.state || ''} {order.shippingAddress.postalCode || ''}
                </Typography>
                <Typography>{order.shippingAddress.country || ''}</Typography>
              </>
            ) : (
              <Typography color="text.secondary">No shipping address provided</Typography>
            )}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>Actions</Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/orders')}
              >
                Back to Orders
              </Button>
              {order.trackingNumber && (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LocalShipping />}
                  onClick={() => window.open(`https://www.17track.net/en/track#nums=${order.trackingNumber}`, '_blank')}
                >
                  Track Package
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetails;
