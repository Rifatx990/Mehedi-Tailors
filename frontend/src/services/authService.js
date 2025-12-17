import api from './api';
import { getToken, getUser, isAuthenticated as checkAuth } from '../utils/auth';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    return getUser();
  },

  // Get token from localStorage
  getToken: () => {
    return getToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return checkAuth();
  },

  // Check if user is admin
  isAdmin: () => {
    const user = getUser();
    return user && user.role === 'admin';
  },

  // Check if user is worker
  isWorker: () => {
    const user = getUser();
    return user && user.role === 'worker';
  }
};

export default authService;
