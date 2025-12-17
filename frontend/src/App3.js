import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<div className="p-8">Shop Page</div>} />
        <Route path="/login" element={<div className="p-8">Login Page</div>} />
        <Route path="/register" element={<div className="p-8">Register Page</div>} />
        <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
      </Routes>
    </Layout>
  );
}

export default App;
