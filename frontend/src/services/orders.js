import api from './api';

export const createOrderFromCart = async (shippingAddress, couponCode) => {
  const response = await api.post('/orders/checkout', {
    shippingAddress,
    couponCode,
    paymentMethod: 'card'
  });
  return response.data;
};

// Helper function to find product by name/ID from API
const findProductId = async (item) => {
  // If it's already a valid MongoDB ObjectId format (24 hex chars), use it
  const possibleId = item._id || item.id || item.productId;
  if (possibleId && /^[0-9a-fA-F]{24}$/.test(String(possibleId))) {
    return String(possibleId);
  }

  // Otherwise, search for product by name
  try {
    // Try search endpoint first
    let products = [];
    try {
      const searchResponse = await api.get('/products/search', {
        params: { q: item.name, limit: 20 }
      });
      products = searchResponse.data?.products || searchResponse.data || [];
    } catch (searchError) {
      // If search endpoint doesn't exist, use regular products endpoint with search param
      const productsResponse = await api.get('/products', {
        params: { search: item.name, limit: 50 }
      });
      products = productsResponse.data?.products || productsResponse.data || [];
    }
    
    // Find exact match by name
    let matchedProduct = products.find(p => 
      p.name && item.name && p.name.toLowerCase() === item.name.toLowerCase()
    );
    
    // If no exact match, try partial match
    if (!matchedProduct) {
      matchedProduct = products.find(p => 
        p.name && item.name && p.name.toLowerCase().includes(item.name.toLowerCase())
      );
    }
    
    // If still no match, try matching by name and price
    if (!matchedProduct && item.price) {
      matchedProduct = products.find(p => 
        p.name && item.name && 
        p.name.toLowerCase() === item.name.toLowerCase() &&
        Math.abs((p.price || 0) - item.price) < 0.01
      );
    }
    
    if (matchedProduct && matchedProduct._id) {
      return String(matchedProduct._id);
    }
    
    throw new Error(`Product not found: ${item.name}`);
  } catch (error) {
    console.error(`Failed to find product ID for "${item.name}":`, error);
    throw error;
  }
};

// Create order directly from items (bypasses backend cart)
export const createOrderFromItems = async (items, shippingAddress, couponCode) => {
  // Prepare order items with name and price for backend lookup
  // Backend will handle finding products by name if ID is invalid
  const orderItems = items.map(item => ({
    product: item._id || item.id || item.productId, // May be invalid ObjectId (e.g., "SP-...")
    name: item.name, // Include name for backend lookup fallback
    qty: item.quantity || 1,
    price: item.price,
    sku: item.sku // Include SKU if available
  }));

  // Calculate total
  const totalPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const response = await api.post('/orders', {
    orderItems,
    totalPrice,
    shippingAddress,
    couponCode,
    paymentMethod: 'card'
  });
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

export const fetchOrders = getMyOrders; // Alias for backward compatibility

export const updateOrderStatus = async (orderId, status, notes) => {
  const response = await api.put(`/orders/${orderId}/status`, {
    status,
    notes
  });
  return response.data;
};

export const getSellerOrders = async () => {
  const response = await api.get('/orders/seller/my-orders');
  return response.data;
};
