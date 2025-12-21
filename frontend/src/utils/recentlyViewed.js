const KEY = 'recently_viewed';
const LIMIT = 12;

export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentlyViewed = (product) => {
  const list = getRecentlyViewed().filter((p) => p.id !== product.id);
  const next = [product, ...list].slice(0, LIMIT);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
};


