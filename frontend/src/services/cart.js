import api from './api';

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/add', {
    productId,
    quantity
  });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await api.put('/cart/update', {
    productId,
    quantity
  });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/item/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};

export const syncCartToBackend = async (localCartItems) => {
  // Sync all local cart items to backend
  if (!localCartItems || localCartItems.length === 0) {
    return false;
  }

  try {
    // First, clear the backend cart
    try {
      await clearCart();
    } catch (clearError) {
      // Ignore if cart doesn't exist - that's fine
      console.log('Backend cart was already empty or doesn\'t exist');
    }
    
    // Then add all items one by one
    const syncResults = [];
    for (const item of localCartItems) {
      // Handle different ID formats: _id, id, or productId
      let productId = item._id || item.id || item.productId;
      
      // If productId is still not found, try to extract from nested objects
      if (!productId && item.product) {
        productId = item.product._id || item.product.id || item.product;
      }
      
      if (productId) {
        try {
          // Convert to string if it's an object
          const idString = typeof productId === 'object' ? productId.toString() : String(productId);
          await addToCart(idString, item.quantity || 1);
          syncResults.push({ success: true, item: item.name || 'Unknown' });
        } catch (err) {
          console.error(`Failed to add "${item.name || 'item'}" to backend cart:`, err);
          syncResults.push({ 
            success: false, 
            item: item.name || 'Unknown',
            error: err.response?.data?.message || err.message 
          });
        }
      } else {
        console.warn('Could not find product ID for item:', item);
        syncResults.push({ success: false, item: item.name || 'Unknown', error: 'No product ID found' });
      }
    }
    
    // Return true if at least one item was synced successfully
    const successCount = syncResults.filter(r => r.success).length;
    if (successCount === 0) {
      throw new Error('Failed to sync any items to backend cart');
    }
    
    return successCount === localCartItems.length;
  } catch (error) {
    console.error('Failed to sync cart to backend:', error);
    throw error;
  }
};

