import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import api from '../../services/api';

const CheckoutForm = ({ orderId, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setMessage(result.error.message || 'Payment failed.');
        setIsProcessing(false);
      } else if (result.paymentIntent) {
        // Confirm payment on backend
        try {
          await api.post('/payments/confirm-payment', {
            paymentIntentId: result.paymentIntent.id
          });
        } catch (confirmError) {
          console.error('Failed to confirm payment on backend:', confirmError);
        }

        switch (result.paymentIntent.status) {
          case 'succeeded':
            setMessage('Payment succeeded! Redirecting...');
            setTimeout(() => {
              if (onPaymentSuccess) {
                onPaymentSuccess();
              } else {
                navigate('/orders');
              }
            }, 2000);
            break;
          case 'processing':
            setMessage('Payment is processing. We will update your orders soon.');
            setTimeout(() => {
              navigate('/orders');
            }, 3000);
            break;
          default:
            setMessage('Payment status: ' + result.paymentIntent.status);
            break;
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.message || 'An error occurred during payment.');
      setIsProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="h6" gutterBottom>
          Order #{orderId?.slice(-8).toUpperCase() || '—'}
        </Typography>
        <Typography color="text.secondary">
          Secure payment powered by Stripe. All major cards and wallets supported.
        </Typography>
      </Box>

      <PaymentElement options={{ layout: 'tabs' }} />

      <Button
        type="submit"
        variant="contained"
        disabled={isProcessing || !stripe || !elements}
        sx={{ py: 1.2 }}
      >
        {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Confirm Payment'}
      </Button>

      {message && (
        <Alert severity={message.includes('succeed') ? 'success' : 'warning'}>{message}</Alert>
      )}
    </Box>
  );
};

export default CheckoutForm;

