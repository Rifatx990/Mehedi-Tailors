import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingCartIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/outline';
import SalesChart from '../../components/Admin/SalesChart';
import RecentOrders from '../../components/Admin/RecentOrders';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    todaySales: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    // fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: 'Total Sales',
      value: `৳${stats.totalSales.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCartIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      change: '-3.1%',
      trend: 'down',
      icon: ChartBarIcon,
      color: 'bg-yellow-500'
    }
  ];

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access the admin dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex space-x-3">
              <button className="btn-primary">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <RecentOrders />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/products"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="bg-blue-100 p-3 rounded-lg inline-block mb-2">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium">Manage Products</p>
            </Link>
            <Link
              to="/admin/orders"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="bg-green-100 p-3 rounded-lg inline-block mb-2">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium">Manage Orders</p>
            </Link>
            <Link
              to="/admin/customers"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="bg-purple-100 p-3 rounded-lg inline-block mb-2">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium">Manage Customers</p>
            </Link>
            <Link
              to="/admin/workers"
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="bg-yellow-100 p-3 rounded-lg inline-block mb-2">
                <UsersIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="font-medium">Manage Workers</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
