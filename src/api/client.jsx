const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  getMe: () => request('GET', '/auth/me'),

  // Products
  getProducts: (params) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/products?${q}`);
  },
  getProduct: (id) => request('GET', `/products/${id}`),
  createProduct: (body) => request('POST', '/products', body),
  updateProduct: (id, body) => request('PUT', `/products/${id}`, body),
  deleteProduct: (id) => request('DELETE', `/products/${id}`),

  // Cart
  getCart: () => request('GET', '/cart'),
  addToCart: (body) => request('POST', '/cart', body),
  updateCartItem: (productId, body) => request('PUT', `/cart/${productId}`, body),
  removeFromCart: (productId) => request('DELETE', `/cart/${productId}`),

  // Orders
  placeOrder: (body) => request('POST', '/orders', body),
  getMyOrders: () => request('GET', '/orders/my'),
  getMyOrder: (id) => request('GET', `/orders/my/${id}`),
  getAllOrders: () => request('GET', '/orders/all'),
  getOrderDetail: (id) => request('GET', `/orders/all/${id}`),
  updateOrderStatus: (id, body) => request('PUT', `/orders/${id}/status`, body),
  getDashboard: () => request('GET', '/orders/dashboard'),
};
