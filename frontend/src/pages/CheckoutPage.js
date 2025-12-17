import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    delivery_address: user?.address || '',
    notes: '',
    delivery_date: '',
    payment_method: 'cod'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.delivery_address) {
      toast.error('Please enter delivery address');
      return;
    }

    if (!formData.delivery_date) {
      toast.error('Please select delivery date');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          fabric: item.fabric
        })),
        ...formData
      };

      await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} 
                       className="flex items-center border-b pb-4">
                    <img
                      src={item.product.images?.[0] || '/images/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium text-gray-800">{item.product.name}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="mr-3">Size: {item.size}</span>
                        <span className="mr-3">Color: {item.color}</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Information */}
            <div className="card p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Enter complete delivery address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="input-field"
                    placeholder="Any special instructions for delivery..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                {[
                  { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
                  { id: 'bkash', label: 'bKash', description: 'Send payment to 01712-345678' },
                  { id: 'nagad', label: 'Nagad', description: 'Send payment to 01712-345678' },
                  { id: 'card', label: 'Credit/Debit Card', description: 'Pay securely with your card' }
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                      formData.payment_method === method.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={formData.payment_method === method.id}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600"
                    />
                    <div className="ml-3">
                      <span className="font-medium">{method.label}</span>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">৳{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="font-medium">৳100</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    ৳{(total + 100).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    className="h-4 w-4 text-primary-600 mt-1"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="/terms" className="text-primary-600 hover:underline">
                      Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              {/* Security Note */}
              <p className="text-center text-sm text-gray-500 mt-4">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>

            {/* Customer Information */}
            <div className="card p-6 mt-6">
              <h3 className="font-semibold mb-4">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-600">Name:</span> {user?.name}</p>
                <p><span className="text-gray-600">Email:</span> {user?.email}</p>
                <p><span className="text-gray-600">Phone:</span> {user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
