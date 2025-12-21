export const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem('orders_local');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalOrders = (orders) => {
  localStorage.setItem('orders_local', JSON.stringify(orders));
};

export const addLocalOrder = (order) => {
  const existing = getLocalOrders();
  const next = [order, ...existing];
  saveLocalOrders(next);
  return order;
};

export const getSavedAddress = () => {
  try {
    const raw = localStorage.getItem('checkout_address');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveAddress = (addr) => {
  localStorage.setItem('checkout_address', JSON.stringify(addr));
};


