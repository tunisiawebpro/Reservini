import { API_BASE_URL } from './config.js';

async function fetchAPI(endpoint, options = {}) {
  const defaultOptions = {
    credentials: 'include', // مهم جداً لإرسال واستقبال HttpOnly Cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...defaultOptions, ...options });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
}

export const api = {
  auth: {
    register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
    me: () => fetchAPI('/auth/me'),
  },
  products: {
    getAll: () => fetchAPI('/products'),
    getBySlug: (slug) => fetchAPI(`/products/${slug}`),
  },
  cart: {
    get: () => fetchAPI('/cart'),
    add: (data) => fetchAPI('/cart/add', { method: 'POST', body: JSON.stringify(data) }),
    remove: (itemId) => fetchAPI(`/cart/${itemId}`, { method: 'DELETE' }),
  },
  orders: {
    checkout: (data) => fetchAPI('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }),
    getUserOrders: () => fetchAPI('/orders'),
  }
};