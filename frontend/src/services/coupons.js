import api from './api';

export const validateCoupon = async (couponCode) => {
  const response = await api.post('/cart/validate-coupon', {
    couponCode
  });
  return response.data;
};

export const getActiveCoupons = async () => {
  const response = await api.get('/coupons/active');
  return response.data;
};



