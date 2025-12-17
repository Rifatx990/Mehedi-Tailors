import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/outline';

const RecentOrders = () => {
  // Sample data - replace with real data from API
  const orders = [
    { id: 'ORD-12345', customer: 'John Doe', amount: 1250, status: 'completed', date: '2024-01-15' },
    { id: 'ORD-12346', customer: 'Jane Smith', amount: 8500, status: 'processing', date: '2024-01-14' },
    { id: 'ORD-12347', customer: 'Robert Johnson', amount: 2200, status: 'pending', date: '2024-01-14' },
    { id: 'ORD-12348', customer: 'Sarah Williams', amount: 3500, status: 'completed', date: '2024-01-13' },
    { id: 'ORD-12349', customer: 'Michael Brown', amount: 4500, status: 'cancelled', date: '2024-01-12' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'processing':
        return 'badge-info';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <Link to="/admin/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All →
        </Link>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(order.status)}
              <div>
                <p className="font-medium text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-500">{order.customer}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`badge ${getStatusClass(order.status)} capitalize`}>
                {order.status}
              </span>
              <p className="font-bold text-gray-900 mt-1">৳{order.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{order.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentOrders;
