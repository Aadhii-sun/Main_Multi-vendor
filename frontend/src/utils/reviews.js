const KEY = 'product_reviews';

const readAll = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAll = (obj) => localStorage.setItem(KEY, JSON.stringify(obj));

export const getReviews = (productId) => {
  const all = readAll();
  return all[productId] || [];
};

export const addReview = (productId, review) => {
  const all = readAll();
  const list = all[productId] || [];
  const next = [{ ...review, id: `REV-${Date.now()}` }, ...list];
  all[productId] = next;
  writeAll(all);
  return next;
};


