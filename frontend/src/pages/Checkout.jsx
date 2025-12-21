import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import CheckoutForm from '../components/Payments/CheckoutForm.jsx';
import { createCheckoutIntent } from '../services/payments';
import { createOrderFromCart, createOrderFromItems } from '../services/orders';
import { validateCoupon } from '../services/coupons';
import { syncCartToBackend } from '../services/cart';
import { useCart } from '../contexts/CartContext.jsx';
import { addLocalOrder, getSavedAddress, saveAddress } from '../utils/localOrders';
import { useAuth } from '../contexts/AuthContext.jsx';

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();
  const { items, subtotal, clear } = useCart();
  const { currentUser } = useAuth();
  const [address, setAddress] = useState(() => getSavedAddress() || { name: '', line1: '', city: '', country: '' });
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const {
    mutateAsync: createIntent,
    data,
    isLoading,
    isError,
    error,
  } = useMutation({
    mutationFn: createCheckoutIntent,
  });

  const {
    mutateAsync: createOrder,
    isLoading: isCreatingOrderMutation,
  } = useMutation({
    mutationFn: createOrderFromCart,
  });

  // Create payment intent when orderId is available
  useEffect(() => {
    const finalOrderId = orderId || createdOrderId;
    if (!finalOrderId || !publishableKey) {
      return;
    }
    createIntent({ orderId: finalOrderId }).catch(() => {});
  }, [orderId, createdOrderId, createIntent, publishableKey]);

  // Handle coupon validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await validateCoupon(couponCode.trim());
      if (result.valid) {
        setAppliedCoupon(result.coupon);
        setCouponError('');
      } else {
        setCouponError(result.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Failed to validate coupon');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle creating order and proceeding to Stripe payment
  const handleProceedToStripe = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    if (!address.name || !address.line1 || !address.city || !address.country) {
      alert('Please fill in all address fields');
      return;
    }

    if (!currentUser) {
      alert('Please login to proceed with checkout');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty. Please add items to your cart first.');
      navigate('/products');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      // Try to create order directly from items (bypasses cart sync)
      // This is more reliable than syncing to backend cart first
      let orderData;
      try {
        orderData = await createOrderFromItems(items, address, appliedCoupon?.code || couponCode || null);
      } catch (directOrderError) {
        // If direct order creation fails, try syncing cart first
        console.warn('Direct order creation failed, trying cart sync method:', directOrderError);
        try {
          await syncCartToBackend(items);
          orderData = await createOrderFromCart(address, appliedCoupon?.code || couponCode || null);
        } catch (syncError) {
          console.error('Both order creation methods failed:', syncError);
          throw directOrderError; // Throw the original error
        }
      }
      if (orderData?.order?._id) {
        setCreatedOrderId(orderData.order._id);
        // Create payment intent for the new order
        await createIntent({ orderId: orderData.order._id });
      } else {
        throw new Error('Order creation failed - no order ID returned');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order. Please try again.';
      alert(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const finalTotal = appliedCoupon ? (subtotal - (appliedCoupon.discount || 0)) : subtotal;

  // Don't redirect - let user see the checkout page even if cart is empty
  // They can navigate back to products from there

  if (!publishableKey) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
          <Typography variant="h5" gutterBottom>
            Checkout
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Payments sandbox not configured. Use the lightweight checkout to place a demo order.
          </Typography>

          {items.length === 0 ? (
            <Alert severity="info">Your cart is empty.</Alert>
          ) : (
            <>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                />
                <TextField
                  label="Address Line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="City"
                    fullWidth
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  <TextField
                    label="Country"
                    fullWidth
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  />
                </Stack>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Order summary</Typography>
                <Box sx={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2, p: 2 }}>
                  {items.map((it) => (
                    <Stack key={it.id} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{it.name} x {it.quantity}</Typography>
                      <Typography variant="body2">${(it.price * it.quantity).toFixed(2)}</Typography>
                    </Stack>
                  ))}
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>Total: ${finalTotal.toFixed(2)}</Typography>
                {publishableKey && currentUser ? (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleProceedToStripe}
                    disabled={!address.name || !address.line1 || !address.city || !address.country || isCreatingOrder}
                  >
                    {isCreatingOrder ? 'Creating Order...' : 'Proceed to Payment'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => {
                      saveAddress(address);
                      const id = `LOCAL-${Date.now()}`;
                      addLocalOrder({
                        id,
                        date: new Date().toLocaleDateString(),
                        total: `$${finalTotal.toFixed(2)}`,
                        status: 'Processing',
                        items,
                        shipping: address,
                      });
                      clear();
                      navigate('/orders');
                    }}
                    disabled={!address.name || !address.line1 || !address.city || !address.country}
                  >
                    Place Order
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    );
  }

  // If there is no orderId but Stripe is configured, allow graceful fallback to lightweight checkout
  // so users can still place an order (e.g., COD or temporary flow).

  const finalOrderId = orderId || createdOrderId;
  const canUseStripe = Boolean(stripePromise && data?.clientSecret && !isError && finalOrderId);
  
  // Determine checkout step
  let activeStep = 0;
  if (finalOrderId) activeStep = 1;
  if (canUseStripe) activeStep = 2;
  
  const steps = ['Cart Review', 'Order Created', 'Payment'];
  
  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          🛒 Secure Checkout
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Complete your payment using encrypted Stripe Elements. We accept all major cards, wallets, and local payment methods.
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            ❌ {error?.response?.data?.message || error?.message || 'Unable to initialize payment.'}
          </Alert>
        )}

        {(isLoading || isCreatingOrder || isCreatingOrderMutation) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, textAlign: 'center' }}>
              {isCreatingOrder || isCreatingOrderMutation ? '⏳ Creating your order...' : '⏳ Initializing payment...'}
            </Typography>
          </Box>
        )}

        {canUseStripe ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: data.clientSecret,
              appearance: { theme: 'flat' },
            }}
          >
            <CheckoutForm orderId={finalOrderId} onPaymentSuccess={() => {
              clear();
              navigate('/orders');
            }} />
          </Elements>
        ) : (
          <>
            {/* Fallback non-Stripe checkout if Stripe init failed or no orderId */}
            {publishableKey && finalOrderId && isError && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Payment initiation failed or no order selected. You can continue with standard checkout.
              </Alert>
            )}
            {items.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your cart is empty. <Button size="small" onClick={() => navigate('/products')} sx={{ ml: 1 }}>Continue Shopping</Button>
              </Alert>
            ) : (
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  value={address.name}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                />
                <TextField
                  label="Address Line 1"
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="City"
                    fullWidth
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  <TextField
                    label="Country"
                    fullWidth
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  />
                </Stack>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Order summary</Typography>
                <Box sx={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2, p: 2 }}>
                  {items.map((it) => (
                    <Stack key={it.id} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{it.name} x {it.quantity}</Typography>
                      <Typography variant="body2">${(it.price * it.quantity).toFixed(2)}</Typography>
                    </Stack>
                  ))}
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>Total: ${finalTotal.toFixed(2)}</Typography>
                {publishableKey && currentUser ? (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleProceedToStripe}
                    disabled={!address.name || !address.line1 || !address.city || !address.country || isCreatingOrder}
                  >
                    {isCreatingOrder ? 'Creating Order...' : 'Proceed to Payment'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={() => {
                      saveAddress(address);
                      const id = `LOCAL-${Date.now()}`;
                      addLocalOrder({
                        id,
                        date: new Date().toLocaleDateString(),
                        total: `$${finalTotal.toFixed(2)}`,
                        status: 'Processing',
                        items,
                        shipping: address,
                      });
                      clear();
                      navigate('/orders');
                    }}
                    disabled={!address.name || !address.line1 || !address.city || !address.country}
                  >
                    Place Order
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;

