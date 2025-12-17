import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from './components/Layout/Layout';

// Public Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CustomTailoringPage from './pages/CustomTailoringPage';

// Protected Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import ProfilePage from './pages/dashboard/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminWorkers from './pages/admin/Workers';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';

// 404 Page
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/custom-tailoring" element={<CustomTailoringPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Customer Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['customer', 'admin', 'worker']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute roles={['customer', 'admin', 'worker']}>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute roles={['customer', 'admin', 'worker']}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute roles={['admin']}>
            <AdminProducts />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute roles={['admin']}>
            <AdminOrders />
          </ProtectedRoute>
        } />
        <Route path="/admin/customers" element={
          <ProtectedRoute roles={['admin']}>
            <AdminCustomers />
          </ProtectedRoute>
        } />
        <Route path="/admin/workers" element={
          <ProtectedRoute roles={['admin']}>
            <AdminWorkers />
          </ProtectedRoute>
        } />
        
        {/* Worker Protected Routes */}
        <Route path="/worker" element={
          <ProtectedRoute roles={['worker', 'admin']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
