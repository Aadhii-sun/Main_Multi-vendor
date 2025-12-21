import api from './api';

export const createCheckoutIntent = async ({ orderId }) => {
  const response = await api.post('/payments/checkout-payment', { orderId });
  return response.data;
};

