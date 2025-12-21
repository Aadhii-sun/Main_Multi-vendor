const KEY = 'address_book';

export const readAddresses = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const writeAddresses = (list) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};


