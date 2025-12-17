import api from './api';

const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Create custom tailoring order
  createCustomOrder: async (customOrderData) => {
    const response = await api.post('/orders/custom', customOrderData);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get single order
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (id, statusData) => {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data;
  },

  // Get sales report (admin only)
  getSalesReport: async (params) => {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  }
};

export default orderService;
